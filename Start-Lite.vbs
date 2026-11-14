Option Explicit
Dim shell, files, root, script, result, host
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
root = files.GetParentFolderName(WScript.ScriptFullName)
script = files.BuildPath(root, "scripts\start-lite.ps1")
host = shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\PowerShell\7\pwsh.exe"
If Not files.FileExists(host) Then
  host = shell.ExpandEnvironmentStrings("%SystemRoot%") & "\System32\WindowsPowerShell\v1.0\powershell.exe"
End If
On Error Resume Next
result = shell.Run("""" & host & """ -NoLogo -NoProfile -STA -WindowStyle Hidden -ExecutionPolicy Bypass -File """ & script & """", 0, False)
If Err.Number <> 0 Then
  MsgBox "The application could not start. " & Err.Description, vbCritical, "Meal Planner"
End If
