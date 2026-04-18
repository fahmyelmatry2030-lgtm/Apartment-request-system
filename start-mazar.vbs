Set WshShell = CreateObject("WScript.Shell")
' Launch Mazar Booking Desktop App - Production Mode
' Prepares standalone assets then opens Electron (no visible terminal)
WshShell.Run "cmd /c cd /d E:\MazarBooking && npm run desktop:run", 0, False
