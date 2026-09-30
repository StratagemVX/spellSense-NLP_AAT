param(
    [string]$file = "AAT2_Spelling_Correction_Tool_Report_FIXED.docx"
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$docxPath = (Resolve-Path $file).Path
$pdfPath = [System.IO.Path]::ChangeExtension($docxPath, ".pdf")

Write-Host "Opening $docxPath"
$doc = $word.Documents.Open($docxPath)
Write-Host "Saving to $pdfPath"
$doc.SaveAs([ref]$pdfPath, [ref]17)
$doc.Close()
$word.Quit()
Write-Host "Export completed successfully."
