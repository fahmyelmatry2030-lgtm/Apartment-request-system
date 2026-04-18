$s = (New-Object -ComObject WScript.Shell).CreateShortcut("C:\Users\fahmy\OneDrive\Desktop\Mazar Booking.lnk")
$s.TargetPath = "wscript.exe"
$s.Arguments = "E:\MazarBooking\start-mazar.vbs"
$s.WorkingDirectory = "E:\MazarBooking"
$s.Save()
