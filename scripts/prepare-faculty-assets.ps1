$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing
$taskRoot = Join-Path (Split-Path $PSScriptRoot) 'assets/game'
$taskSources = 'C:\Users\acer\Desktop\Asset'
New-Item -ItemType Directory -Force (Join-Path $taskRoot 'faculty') | Out-Null
function CopyAsset($zip, $entry, $destination) {
  $stream=$zip.GetEntry($entry).Open()
  try { $out=[IO.File]::Create($destination); try {$stream.CopyTo($out)} finally {$out.Dispose()} } finally {$stream.Dispose()}
}
$taskZip=[IO.Compression.ZipFile]::OpenRead((Join-Path $taskSources 'graphics.zip'))
try {
  foreach ($name in @('Friolera','Draem','Pouch','Pluma','Atrox','Finsta','Ivieron','Jacana','Sparchu')) {
    CopyAsset $taskZip "graphics/icons/$name.png" (Join-Path $taskRoot "icons/$name.png")
    $stream=$taskZip.GetEntry("graphics/monsters/$name.png").Open()
    $bitmap=[Drawing.Bitmap]::new($stream)
    try {
      foreach ($row in 0..1) { foreach ($frame in 0..3) {
        $action=if($row -eq 0){'idle'}else{'attack'}
        $crop=$bitmap.Clone([Drawing.Rectangle]::new($frame*192,$row*192,192,192),[Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {$crop.Save((Join-Path $taskRoot "creatures/$name-$action-$frame.png"))} finally {$crop.Dispose()}
      }}
    } finally {$bitmap.Dispose();$stream.Dispose()}
  }
} finally {$taskZip.Dispose()}
$taskZip=[IO.Compression.ZipFile]::OpenRead((Join-Path $taskSources 'Free Sample.zip'))
try {
  CopyAsset $taskZip 'Free Sample/Battle/spr_battle_empty.png' (Join-Path $taskRoot 'backgrounds/faculty-arena.png')
  CopyAsset $taskZip 'Free Sample/Battle/spr_battlebacks_free.png' (Join-Path $taskRoot 'backgrounds/faculty-backs.png')
  CopyAsset $taskZip 'Free Sample/READ ME.txt' (Join-Path $taskRoot 'faculty/yanako-credit.txt')
} finally {$taskZip.Dispose()}
$taskZip=[IO.Compression.ZipFile]::OpenRead((Join-Path $taskSources 'Townspeople.zip'))
try {
 $entry=$taskZip.Entries | Where-Object Name -eq 'Townspeople_Trainers.png' | Select-Object -First 1
 $stream=$entry.Open();$bitmap=[Drawing.Bitmap]::new($stream)
 try { $index=0; foreach($cell in @(@(2,1),@(0,2),@(1,2))) {
  $crop=$bitmap.Clone([Drawing.Rectangle]::new($cell[0]*64,$cell[1]*64,64,64),[Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {$crop.Save((Join-Path $taskRoot "faculty/trainer-$index.png"))} finally {$crop.Dispose()};$index++
 }} finally {$bitmap.Dispose();$stream.Dispose()}
} finally {$taskZip.Dispose()}
Copy-Item -LiteralPath (Join-Path $taskSources '03. A New Beginning.mp3') -Destination (Join-Path $taskRoot 'audio/new-beginning.mp3')
Copy-Item -LiteralPath (Join-Path $taskSources 'trainer battle.mp3') -Destination (Join-Path $taskRoot 'audio/trainer-battle.mp3')
$taskZip=[IO.Compression.ZipFile]::OpenRead((Join-Path $taskSources 'Pokemon SFX Attack Moves & Sound Effects Collection.zip'))
try { foreach($name in @('Ice Beam','Blizzard','Confusion','Psychic','Bite','Crunch')) {
 $entry=$taskZip.Entries | Where-Object { $_.Name -eq "$name.mp3" -and $_.FullName -like '*GEN 3*' } | Select-Object -First 1
 if(!$entry){throw "Missing SFX $name"}
 CopyAsset $taskZip $entry.FullName (Join-Path $taskRoot "audio/$($name.ToLower().Replace(' ','-')).mp3")
}} finally {$taskZip.Dispose()}
$taskBackground=Join-Path $taskRoot 'backgrounds/faculty-backs.png'
$taskBitmap=[Drawing.Bitmap]::new($taskBackground)
$taskCrop=$taskBitmap.Clone([Drawing.Rectangle]::new(0,0,256,110),[Drawing.Imaging.PixelFormat]::Format32bppArgb)
$taskBitmap.Dispose()
try {$taskCrop.Save($taskBackground,[Drawing.Imaging.ImageFormat]::Png)} finally {$taskCrop.Dispose()}
Write-Output 'Selected animated creatures, trainer portraits, arena and music prepared.'
