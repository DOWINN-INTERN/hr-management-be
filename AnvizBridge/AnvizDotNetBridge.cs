using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;
using System.Linq;
using System.Net;
using Newtonsoft.Json;
using Anviz.SDK;
using Anviz.SDK.Responses;

public class AnvizDotNetBridge
{
    private Dictionary<string, DeviceContext> connectedDevices = new Dictionary<string, DeviceContext>();
    private AnvizManager manager;

    public AnvizDotNetBridge()
    {
        manager = new AnvizManager();
    }

    public async Task<string> ConnectDevice(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            string ipAddress = input.ipAddress.ToString();
            int port = Convert.ToInt32(input.port);

            // Configure manager if credentials provided
            if (input.username != null && input.password != null)
            {
                manager.ConnectionUser = input.username.ToString();
                manager.ConnectionPassword = input.password.ToString();
                manager.AuthenticateConnection = true;
            }

            // Connect to device
            var device = await manager.Connect(ipAddress);
            
            // Store connected device with deviceId as key
            connectedDevices[deviceId] = device;
            
            // Register event handlers
            device.DevicePing += (s, e) => Console.WriteLine($"Device {deviceId}: Ping received");
            device.ReceivedRecord += (s, e) => Console.WriteLine($"Device {deviceId}: Record received at {e.DateTime}");
            
            // Get basic device info
            var id = device.DeviceId;
            var serialNumber = await device.GetDeviceSN();
            var deviceType = await device.GetDeviceTypeCode();
            var biometricType = await device.GetDeviceBiometricType();
            var netParams = await device.GetTcpParameters();
            var basic = await device.GetBasicSettings();
            
            // Return device info
            var result = new
            {
                id = deviceId,
                internalId = id,
                ipAddress = ipAddress,
                macAddress = netParams.MacAddress,
                serialNumber = serialNumber,
                deviceType = deviceType.ToString(),
                biometricType = biometricType.ToString(),
                firmware = basic.Firmware,
                isConnected = true
            };

            return JsonConvert.SerializeObject(result);
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message, stack = ex.StackTrace });
        }
    }

    public async Task<string> DisconnectDevice(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            
            if (connectedDevices.TryGetValue(deviceId, out var device))
            {
                device.Dispose();
                connectedDevices.Remove(deviceId);
                return JsonConvert.SerializeObject(new { success = true, message = "Device disconnected successfully" });
            }
            
            return JsonConvert.SerializeObject(new { success = false, error = "Device not found" });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { success = false, error = ex.Message });
        }
    }

    public async Task<string> GetDeviceInfo(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            var netParams = await device.GetTcpParameters();
            var basic = await device.GetBasicSettings();
            var advanced = await device.GetAdvancedSettings();
            var stats = await device.GetDownloadInformation();
            var sn = await device.GetDeviceSN();
            var type = await device.GetDeviceTypeCode();
            var biotype = await device.GetDeviceBiometricType();
            var deviceTime = await device.GetDateTime();
            
            var result = new
            {
                deviceId = deviceId,
                internalId = device.DeviceId,
                serialNumber = sn,
                deviceType = type.ToString(),
                biometricType = biotype.ToString(),
                firmware = basic.Firmware,
                networkInfo = new {
                    ipAddress = netParams.IP.ToString(),
                    subnetMask = netParams.SubnetMask.ToString(),
                    gateway = netParams.DefaultGateway.ToString(),
                    macAddress = netParams.MacAddress,
                    tcpMode = netParams.TcpMode.ToString()
                },
                settings = new {
                    volume = basic.Volume.ToString(),
                    dateFormat = basic.DateFormat.ToString(),
                    is24HourClock = basic.Is24HourClock,
                    fpPrecision = advanced.FPPrecision.ToString(),
                    repeatAttendanceDelay = advanced.RepeatAttendanceDelay,
                    realTimeMode = advanced.RealTimeMode
                },
                capacity = new {
                    totalUsers = stats.UserAmount,
                    totalRecords = stats.AllRecordAmount,
                    newRecords = stats.NewRecordAmount
                },
                currentTime = deviceTime.ToString("yyyy-MM-dd HH:mm:ss")
            };
            
            return JsonConvert.SerializeObject(result);
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }
    
    public async Task<string> SetDeviceTime(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            DateTime dateTime = input.dateTime != null 
                ? DateTime.Parse(input.dateTime.ToString()) 
                : DateTime.Now;
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            await device.SetDateTime(dateTime);
            
            return JsonConvert.SerializeObject(new { 
                success = true,
                message = "Device time updated successfully", 
                time = dateTime.ToString("yyyy-MM-dd HH:mm:ss")
            });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }
    
    public async Task<string> GetUsers(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            var employees = await device.GetEmployeesData();
            
            var users = employees.Select(e => new {
                userId = e.Id.ToString(),
                name = e.Name,
                password = e.Password,
                cardNumber = e.Card.ToString(),
                privilegeLevel = e.PrivilegeLevel.ToString(),
                enrolledFingerprints = e.EnrolledFingerprints.Select(f => f.ToString()).ToArray()
            }).ToArray();
            
            return JsonConvert.SerializeObject(new { 
                success = true,
                users = users,
                count = users.Length
            });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }
    
    public async Task<string> GetUserFingerprints(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            ulong userId = Convert.ToUInt64(input.userId);
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            // Get employee info first to check enrolled fingerprints
            var employees = await device.GetEmployeesData();
            var employee = employees.FirstOrDefault(e => e.Id == userId);
            
            if (employee == null)
            {
                return JsonConvert.SerializeObject(new { error = "User not found" });
            }
            
            var fingerprintTemplates = new List<object>();
            
            foreach (var finger in employee.EnrolledFingerprints)
            {
                var template = await device.GetFingerprintTemplate(userId, finger);
                fingerprintTemplates.Add(new {
                    fingerId = (int)finger,
                    fingerName = finger.ToString(),
                    template = Convert.ToBase64String(template)
                });
            }
            
            return JsonConvert.SerializeObject(new { 
                success = true,
                userId = userId.ToString(),
                name = employee.Name,
                fingerprints = fingerprintTemplates
            });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }
    
    public async Task<string> RegisterUser(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            ulong userId = Convert.ToUInt64(input.userId);
            string name = input.name.ToString();
            string password = input.password != null ? input.password.ToString() : "";
            ulong cardNumber = input.cardNumber != null ? Convert.ToUInt64(input.cardNumber) : 0;
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            var employee = new UserInfo(userId, name)
            {
                Password = password,
                Card = cardNumber
            };
            
            await device.SetEmployeesData(employee);
            
            return JsonConvert.SerializeObject(new { 
                success = true,
                message = "User registered successfully",
                user = new {
                    userId = userId.ToString(),
                    name = name,
                    password = password,
                    cardNumber = cardNumber.ToString()
                }
            });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }
    
    public async Task<string> DeleteUser(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            ulong userId = Convert.ToUInt64(input.userId);
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            await device.DeleteUser(userId);
            
            return JsonConvert.SerializeObject(new { 
                success = true,
                message = $"User {userId} deleted successfully"
            });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }
    
    public async Task<string> EnrollFingerprint(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            ulong userId = Convert.ToUInt64(input.userId);
            int fingerIndex = input.fingerId != null ? Convert.ToInt32(input.fingerId) : 0;
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            // Convert fingerIndex to Finger enum
            var finger = (Anviz.SDK.Utils.Finger)fingerIndex;
            
            // Start fingerprint enrollment
            var template = await device.EnrollFingerprint(userId, fingerIndex);
            
            // Save the template to the device
            await device.SetFingerprintTemplate(userId, finger, template);
            
            return JsonConvert.SerializeObject(new { 
                success = true,
                message = "Fingerprint enrolled successfully",
                fingerprint = new {
                    userId = userId.ToString(),
                    fingerId = fingerIndex,
                    template = Convert.ToBase64String(template)
                }
            });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }
    
    public async Task<string> UploadFingerprintTemplate(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            ulong userId = Convert.ToUInt64(input.userId);
            int fingerIndex = Convert.ToInt32(input.fingerId);
            string templateBase64 = input.template.ToString();
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            // Convert base64 template to byte array
            var template = Convert.FromBase64String(templateBase64);
            
            // Convert fingerIndex to Finger enum
            var finger = (Anviz.SDK.Utils.Finger)fingerIndex;
            
            // Upload template to device
            await device.SetFingerprintTemplate(userId, finger, template);
            
            return JsonConvert.SerializeObject(new { 
                success = true,
                message = "Fingerprint template uploaded successfully"
            });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }
    
    public async Task<string> GetAttendanceRecords(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            bool onlyNew = input.onlyNew != null ? Convert.ToBoolean(input.onlyNew) : true;
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            // Download records
            var records = await device.DownloadRecords(onlyNew);
            
            // Get employees data for mapping IDs to names
            var employees = await device.GetEmployeesData();
            var employeeDict = employees.ToDictionary(e => e.Id, e => e.Name);
            
            var formattedRecords = records.Select(r => new {
                userId = r.UserCode.ToString(),
                userName = employeeDict.ContainsKey(r.UserCode) ? employeeDict[r.UserCode] : "Unknown",
                timestamp = r.DateTime.ToString("yyyy-MM-dd HH:mm:ss"),
                backupCode = r.BackupCode,
                deviceId = deviceId,
                status = r.Status.ToString(),
                verificationMethod = r.VerificationMethod.ToString()
            }).ToArray();
            
            return JsonConvert.SerializeObject(new { 
                success = true,
                records = formattedRecords,
                count = formattedRecords.Length
            });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }
    
    public async Task<string> ClearAttendanceRecords(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            bool onlyNew = input.onlyNew != null ? Convert.ToBoolean(input.onlyNew) : true;
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            if (onlyNew)
            {
                await device.ClearNewRecords();
            }
            else
            {
                await device.ClearRecords();
            }
            
            return JsonConvert.SerializeObject(new { 
                success = true,
                message = onlyNew ? "New attendance records cleared" : "All attendance records cleared"
            });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }
    
    public async Task<string> UnlockDoor(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            await device.Unlock();
            
            return JsonConvert.SerializeObject(new { 
                success = true,
                message = "Door unlocked successfully"
            });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }
    
    public async Task<string> RestartDevice(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            await device.Reboot();
            
            // The device will disconnect after reboot, so remove it from our dictionary
            connectedDevices.Remove(deviceId);
            
            return JsonConvert.SerializeObject(new { 
                success = true,
                message = "Device restart command sent successfully"
            });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }

    public async Task<string> EnableRealTimeMode(dynamic input)
    {
        try
        {
            string deviceId = input.deviceId.ToString();
            
            if (!connectedDevices.TryGetValue(deviceId, out var device))
            {
                return JsonConvert.SerializeObject(new { error = "Device not found" });
            }
            
            var advanced = await device.GetAdvancedSettings();
            if (!advanced.RealTimeMode)
            {
                advanced.RealTimeMode = true;
                await device.SetAdvancedSettings(advanced);
            }
            
            return JsonConvert.SerializeObject(new { 
                success = true,
                message = "Real-time mode enabled successfully"
            });
        }
        catch (Exception ex)
        {
            return JsonConvert.SerializeObject(new { error = ex.Message });
        }
    }
}