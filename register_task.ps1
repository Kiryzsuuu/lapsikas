param(
  [string]$TaskName = 'SatkerReminderDaily',
  [string]$NodePath = 'C:\\Program Files\\nodejs\\node.exe',
  [string]$ScriptPath = "$(Split-Path -Parent $MyInvocation.MyCommand.Definition)\\scheduler.js"
)

$action = New-ScheduledTaskAction -Execute $NodePath -Argument "`"$ScriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At 07:00AM
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName $TaskName -Description 'Run Satker reminder scheduler daily at 07:00' -Force
Write-Host "Registered task $TaskName to run $ScriptPath daily at 07:00"
