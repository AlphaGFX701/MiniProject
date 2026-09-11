$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing

$Project = Split-Path -Parent $PSScriptRoot
$AssetRoot = Join-Path $Project 'assets\game'
$SourceRoot = 'C:\Users\acer\Desktop\Asset'

@('backgrounds', 'creatures', 'icons', 'player', 'effects\ultimate', 'fonts', 'audio', 'branding') |
  ForEach-Object { New-Item -ItemType Directory -Force -Path (Join-Path $AssetRoot $_) | Out-Null }

function Open-Zip([string]$Name) {
  [IO.Compression.ZipFile]::OpenRead((Join-Path $SourceRoot $Name))
}

function Copy-Entry($Zip, [string]$EntryName, [string]$Destination) {
  $Entry = $Zip.GetEntry($EntryName)
  if (-not $Entry) { throw "Missing zip entry: $EntryName" }
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Destination) | Out-Null
  $InputStream = $Entry.Open()
  try {
    $OutputStream = [IO.File]::Create($Destination)
    try { $InputStream.CopyTo($OutputStream) } finally { $OutputStream.Dispose() }
  } finally { $InputStream.Dispose() }
}

function Load-Entry-Bitmap($Zip, [string]$EntryName) {
  $Entry = $Zip.GetEntry($EntryName)
  if (-not $Entry) { throw "Missing image entry: $EntryName" }
  $Stream = $Entry.Open()
  try {
    $Temporary = [Drawing.Bitmap]::new($Stream)
    try { return [Drawing.Bitmap]::new($Temporary) } finally { $Temporary.Dispose() }
  } finally { $Stream.Dispose() }
}

function Save-Crop($Bitmap, [Drawing.Rectangle]$Source, [string]$Destination) {
  $Output = [Drawing.Bitmap]::new($Source.Width, $Source.Height, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $Graphics = [Drawing.Graphics]::FromImage($Output)
  try {
    $Graphics.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceCopy
    $Graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $Graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
    $Graphics.DrawImage($Bitmap, [Drawing.Rectangle]::new(0, 0, $Source.Width, $Source.Height), $Source, [Drawing.GraphicsUnit]::Pixel)
  } finally { $Graphics.Dispose() }
  try { $Output.Save($Destination, [Drawing.Imaging.ImageFormat]::Png) } finally { $Output.Dispose() }
}

$GraphicsZip = Open-Zip 'graphics.zip'
try {
  foreach ($Background in @('forest', 'ice', 'sand')) {
    Copy-Entry $GraphicsZip "graphics/backgrounds/$Background.png" (Join-Path $AssetRoot "backgrounds\$Background.png")
  }
  foreach ($Font in @('dogicapixel.otf', 'dogicapixelbold.otf', 'PixeloidSans.ttf')) {
    Copy-Entry $GraphicsZip "graphics/fonts/$Font" (Join-Path $AssetRoot "fonts\$Font")
  }
  foreach ($Effect in @('fire', 'splash', 'green', 'scratch', 'explosion')) {
    Copy-Entry $GraphicsZip "graphics/attacks/$Effect.png" (Join-Path $AssetRoot "effects\$Effect.png")
  }

  foreach ($Name in @('Charmadillo', 'Gulfin', 'Cleaf', 'Cindrill', 'Finiette', 'Larvea')) {
    Copy-Entry $GraphicsZip "graphics/icons/$Name.png" (Join-Path $AssetRoot "icons\$Name.png")
    $Sheet = Load-Entry-Bitmap $GraphicsZip "graphics/monsters/$Name.png"
    try {
      for ($Row = 0; $Row -lt 2; $Row++) {
        $Action = if ($Row -eq 0) { 'idle' } else { 'attack' }
        for ($Frame = 0; $Frame -lt 4; $Frame++) {
          Save-Crop $Sheet ([Drawing.Rectangle]::new($Frame * 192, $Row * 192, 192, 192)) (Join-Path $AssetRoot "creatures\$Name-$Action-$Frame.png")
        }
      }
    } finally { $Sheet.Dispose() }
  }

  $Player = Load-Entry-Bitmap $GraphicsZip 'graphics/characters/player.png'
  try {
    $Directions = @('down', 'left', 'right', 'up')
    for ($Row = 0; $Row -lt 4; $Row++) {
      for ($Frame = 0; $Frame -lt 4; $Frame++) {
        Save-Crop $Player ([Drawing.Rectangle]::new($Frame * 128, $Row * 128, 128, 128)) (Join-Path $AssetRoot "player\player-$($Directions[$Row])-$Frame.png")
      }
    }
  } finally { $Player.Dispose() }
} finally { $GraphicsZip.Dispose() }

$MountainZip = Open-Zip 'Super Mountain Dusk Files.zip'
try {
  Copy-Entry $MountainZip 'Super Mountain Dusk Files/Assets/Version C/preview.png' (Join-Path $AssetRoot 'backgrounds\mountain-dusk.png')
} finally { $MountainZip.Dispose() }

$PixelZip = Open-Zip 'Super Pixel Effects Gigapack (Free Version) v2.8.0.zip'
try {
  for ($Index = 0; $Index -lt 9; $Index++) {
    $File = 'frame{0:D4}.png' -f $Index
    $Entry = "Super Pixel Effects Gigapack (Free Version)/PNG/Explosions/stylized_explosion_001/stylized_explosion_001_small_yellow/$File"
    Copy-Entry $PixelZip $Entry (Join-Path $AssetRoot "effects\ultimate\$File")
  }
} finally { $PixelZip.Dispose() }

$SfxZip = Open-Zip 'Pokemon SFX Attack Moves & Sound Effects Collection.zip'
try {
  $Prefix = 'GEN 3 SFX - Attack Moves - RSE, FR, LG/'
  $AudioFiles = @{
    'tackle.mp3' = 'Tackle.mp3'
    'ember.mp3' = 'Ember.mp3'
    'water-gun.mp3' = 'Water Gun.mp3'
    'razor-leaf.mp3' = 'Razor Leaf.mp3'
    'fire-blast.mp3' = 'Fire Blast.mp3'
    'hydro-pump.mp3' = 'Hydro Pump.mp3'
    'solar-beam.mp3' = 'Solar Beam.mp3'
    'faint.mp3' = 'In-Battle Faint No Health.mp3'
  }
  foreach ($OutputName in $AudioFiles.Keys) {
    Copy-Entry $SfxZip ($Prefix + $AudioFiles[$OutputName]) (Join-Path $AssetRoot "audio\$OutputName")
  }
} finally { $SfxZip.Dispose() }

# Original pixel Echo Orb, drawn at 32px then scaled with nearest-neighbor rendering.
$Small = [Drawing.Bitmap]::new(32, 32, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
$Drawing = [Drawing.Graphics]::FromImage($Small)
try {
  $Drawing.Clear([Drawing.Color]::Transparent)
  $Drawing.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::None
  $Outline = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#10263E'))
  $Aqua = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#21B6A8'))
  $Navy = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#173B57'))
  $Cream = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#FFF7E6'))
  $Yellow = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#FFD166'))
  try {
    $Drawing.FillEllipse($Outline, 1, 1, 30, 30)
    $Drawing.FillPie($Aqua, 4, 4, 24, 24, 180, 180)
    $Drawing.FillPie($Navy, 4, 4, 24, 24, 0, 180)
    $Drawing.FillRectangle($Outline, 3, 14, 26, 4)
    $Drawing.FillEllipse($Outline, 11, 11, 10, 10)
    $Drawing.FillEllipse($Yellow, 13, 13, 6, 6)
    $Drawing.FillRectangle($Cream, 9, 6, 3, 3)
    $Drawing.FillRectangle($Cream, 7, 9, 2, 2)
  } finally {
    $Outline.Dispose(); $Aqua.Dispose(); $Navy.Dispose(); $Cream.Dispose(); $Yellow.Dispose()
  }
} finally { $Drawing.Dispose() }

$Orb = [Drawing.Bitmap]::new(128, 128, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
$OrbGraphics = [Drawing.Graphics]::FromImage($Orb)
try {
  $OrbGraphics.Clear([Drawing.Color]::Transparent)
  $OrbGraphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $OrbGraphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
  $OrbGraphics.DrawImage($Small, [Drawing.Rectangle]::new(0, 0, 128, 128), [Drawing.Rectangle]::new(0, 0, 32, 32), [Drawing.GraphicsUnit]::Pixel)
} finally { $OrbGraphics.Dispose(); $Small.Dispose() }
try { $Orb.Save((Join-Path $AssetRoot 'branding\echo-orb.png'), [Drawing.Imaging.ImageFormat]::Png) } finally { $Orb.Dispose() }

function Write-Tone([string]$Path, [double[]]$Notes, [double]$NoteDuration, [double]$Volume) {
  $SampleRate = 22050
  $SamplesPerNote = [int]($SampleRate * $NoteDuration)
  $TotalSamples = $SamplesPerNote * $Notes.Count
  $Stream = [IO.File]::Create($Path)
  $Writer = [IO.BinaryWriter]::new($Stream)
  try {
    $Writer.Write([Text.Encoding]::ASCII.GetBytes('RIFF'))
    $Writer.Write([int](36 + $TotalSamples * 2))
    $Writer.Write([Text.Encoding]::ASCII.GetBytes('WAVEfmt '))
    $Writer.Write([int]16); $Writer.Write([int16]1); $Writer.Write([int16]1)
    $Writer.Write([int]$SampleRate); $Writer.Write([int]($SampleRate * 2))
    $Writer.Write([int16]2); $Writer.Write([int16]16)
    $Writer.Write([Text.Encoding]::ASCII.GetBytes('data')); $Writer.Write([int]($TotalSamples * 2))
    foreach ($Frequency in $Notes) {
      for ($Index = 0; $Index -lt $SamplesPerNote; $Index++) {
        $Progress = $Index / $SamplesPerNote
        $Envelope = [Math]::Min(1, $Progress * 10) * (1 - $Progress)
        $Wave = [Math]::Sin(2 * [Math]::PI * $Frequency * $Index / $SampleRate)
        $Writer.Write([int16]($Wave * 32767 * $Volume * $Envelope))
      }
    }
  } finally { $Writer.Dispose(); $Stream.Dispose() }
}

Write-Tone (Join-Path $AssetRoot 'audio\throw.wav') @(320, 420, 560, 720) 0.045 0.28
Write-Tone (Join-Path $AssetRoot 'audio\bounce.wav') @(180, 130) 0.08 0.35
Write-Tone (Join-Path $AssetRoot 'audio\capture.wav') @(440, 554.37, 659.25, 880) 0.12 0.30
Write-Tone (Join-Path $AssetRoot 'audio\sound-check.wav') @(523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50) 0.18 0.62

Write-Output 'Prepared game assets.'
