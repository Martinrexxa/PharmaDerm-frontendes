$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Runtime.InteropServices

function Remove-BackgroundWhiteLike {
  param(
    [Parameter(Mandatory = $true)][string]$InputPath,
    [Parameter(Mandatory = $true)][string]$OutputPath,
    [int]$Fuzz = 45,
    [int]$MaxSide = 1000,
    [int]$MinWhite = 200
  )

  $srcOriginal = [System.Drawing.Bitmap]::new($InputPath)
  try {
    $src = $srcOriginal
    $resized = $false
    if ($MaxSide -gt 0) {
      $w0 = $srcOriginal.Width
      $h0 = $srcOriginal.Height
      $max0 = [Math]::Max($w0, $h0)
      if ($max0 -gt $MaxSide) {
        $scale = $MaxSide / $max0
        $wNew = [int][Math]::Max(1, [Math]::Round($w0 * $scale))
        $hNew = [int][Math]::Max(1, [Math]::Round($h0 * $scale))
        $tmp = [System.Drawing.Bitmap]::new($wNew, $hNew, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $gResize = [System.Drawing.Graphics]::FromImage($tmp)
        try {
          $gResize.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
          $gResize.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
          $gResize.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
          $gResize.DrawImage($srcOriginal, 0, 0, $wNew, $hNew)
        } finally {
          $gResize.Dispose()
        }
        $src = $tmp
        $resized = $true
      }
    }

    $w = $src.Width
    $h = $src.Height

    $bmp = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      try { $g.DrawImage($src, 0, 0, $w, $h) } finally { $g.Dispose() }

      # Pick the most common corner color as the background reference.
      $corners = @(
        $bmp.GetPixel(0, 0),
        $bmp.GetPixel($w - 1, 0),
        $bmp.GetPixel(0, $h - 1),
        $bmp.GetPixel($w - 1, $h - 1)
      )
      $bg = $corners |
        Group-Object { "$($_.R),$($_.G),$($_.B)" } |
        Sort-Object Count -Descending |
        Select-Object -First 1
      $parts = $bg.Name.Split(',')
      $bgR = [int]$parts[0]; $bgG = [int]$parts[1]; $bgB = [int]$parts[2]

      $rect = [System.Drawing.Rectangle]::FromLTRB(0, 0, $w, $h)
      $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      try {
        $strideRaw = $data.Stride
        $strideAbs = [Math]::Abs($strideRaw)
        $byteCount = $strideAbs * $h
        $bytes = New-Object byte[] $byteCount
        $scan0Top = $data.Scan0
        if ($strideRaw -lt 0) {
          # When stride is negative, Scan0 points at the first pixel of the bottom scanline.
          $scan0Top = [IntPtr]::Add($scan0Top, $strideRaw * ($h - 1))
        }
        [System.Runtime.InteropServices.Marshal]::Copy($scan0Top, $bytes, 0, $byteCount)

        function Get-Offset([int]$x, [int]$y) {
          return ($y * $strideAbs) + ($x * 4)
        }

        function Test-IsBg([int]$x, [int]$y) {
          $off = Get-Offset $x $y
          if ($off -lt 0 -or ($off + 3) -ge $bytes.Length) { return $false }
          $b = $bytes[$off + 0]
          $g = $bytes[$off + 1]
          $r = $bytes[$off + 2]

          # Guardrail: only consider near-white pixels as background candidates.
          if (-not ($r -ge $MinWhite -and $g -ge $MinWhite -and $b -ge $MinWhite)) { return $false }

          return (
            ([Math]::Abs($r - $bgR) -le $Fuzz) -and
            ([Math]::Abs($g - $bgG) -le $Fuzz) -and
            ([Math]::Abs($b - $bgB) -le $Fuzz)
          )
        }

        # Flood-fill background ONLY from the edges. This preserves white/bright areas inside the product.
        $visited = New-Object 'System.Collections.BitArray' ($w * $h)
        $queue = New-Object 'System.Collections.Generic.Queue[System.Int32]'

        for ($x = 0; $x -lt $w; $x++) {
          $idxTop = $x
          if (-not $visited[$idxTop] -and (Test-IsBg $x 0)) { $visited[$idxTop] = $true; $queue.Enqueue($idxTop) }

          $idxBot = (($h - 1) * $w) + $x
          if (-not $visited[$idxBot] -and (Test-IsBg $x ($h - 1))) { $visited[$idxBot] = $true; $queue.Enqueue($idxBot) }
        }
        for ($y = 0; $y -lt $h; $y++) {
          $idxL = ($y * $w)
          if (-not $visited[$idxL] -and (Test-IsBg 0 $y)) { $visited[$idxL] = $true; $queue.Enqueue($idxL) }

          $idxR = ($y * $w) + ($w - 1)
          if (-not $visited[$idxR] -and (Test-IsBg ($w - 1) $y)) { $visited[$idxR] = $true; $queue.Enqueue($idxR) }
        }

        while ($queue.Count -gt 0) {
          $idx = $queue.Dequeue()
          $y = [int]($idx / $w)
          $x = $idx - ($y * $w)
          $off = Get-Offset $x $y
          if ($off -lt 0 -or ($off + 3) -ge $bytes.Length) { continue }

          $bytes[$off + 3] = 0

          if ($x -gt 0) {
            $n = $idx - 1
            if (-not $visited[$n] -and (Test-IsBg ($x - 1) $y)) { $visited[$n] = $true; $queue.Enqueue($n) }
          }
          if ($x -lt ($w - 1)) {
            $n = $idx + 1
            if (-not $visited[$n] -and (Test-IsBg ($x + 1) $y)) { $visited[$n] = $true; $queue.Enqueue($n) }
          }
          if ($y -gt 0) {
            $n = $idx - $w
            if (-not $visited[$n] -and (Test-IsBg $x ($y - 1))) { $visited[$n] = $true; $queue.Enqueue($n) }
          }
          if ($y -lt ($h - 1)) {
            $n = $idx + $w
            if (-not $visited[$n] -and (Test-IsBg $x ($y + 1))) { $visited[$n] = $true; $queue.Enqueue($n) }
          }
        }

        [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $scan0Top, $byteCount)
      } finally {
        $bmp.UnlockBits($data)
      }

      $outDir = Split-Path -Parent $OutputPath
      if ($outDir -and -not (Test-Path -LiteralPath $outDir)) {
        New-Item -ItemType Directory -Force -Path $outDir | Out-Null
      }
      $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $bmp.Dispose()
    }
    if ($resized) { $src.Dispose() }
  } finally {
    $srcOriginal.Dispose()
  }
}

$srcDir = Join-Path $PSScriptRoot '..\\public\\images\\lrp'
$srcDir = (Resolve-Path -LiteralPath $srcDir).Path

$inputs = Get-ChildItem -LiteralPath $srcDir -File |
  Where-Object { $_.Extension -match '^\.(jpg|jpeg|png)$' } |
  Where-Object { $_.Name -notmatch '-nobg\.png$' }

Write-Host "Processing $($inputs.Count) images from $srcDir"

foreach ($f in $inputs) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
  $out = Join-Path $srcDir ($base + '-nobg.png')
  try {
    Remove-BackgroundWhiteLike -InputPath $f.FullName -OutputPath $out -Fuzz 35 -MaxSide 1200 -MinWhite 245
    Write-Host "OK: $($f.Name) -> $([System.IO.Path]::GetFileName($out))"
  } catch {
    Write-Warning "FAILED: $($f.Name) ($($_.Exception.Message))"
  }
}
