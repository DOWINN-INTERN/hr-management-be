const edge = require('edge-js');
const path = require('path');

// Path to the compiled DLL
const dllPath = path.join(__dirname, '../../../AnvizBridge/bin/Debug/net6.0/AnvizBridge.dll');

// Create references to the .NET methods
const methodRefs = {
  connectDevice: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'ConnectDevice'
  }),
  disconnectDevice: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'DisconnectDevice'
  }),
  getDeviceInfo: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'GetDeviceInfo'
  }),
  setDeviceTime: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'SetDeviceTime'
  }),
  getUsers: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'GetUsers'
  }),
  getUserFingerprints: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'GetUserFingerprints'
  }),
  registerUser: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'RegisterUser'
  }),
  deleteUser: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'DeleteUser'
  }),
  enrollFingerprint: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'EnrollFingerprint'
  }),
  uploadFingerprintTemplate: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'UploadFingerprintTemplate'
  }),
  getAttendanceRecords: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'GetAttendanceRecords'
  }),
  clearAttendanceRecords: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'ClearAttendanceRecords'
  }),
  unlockDoor: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'UnlockDoor'
  }),
  restartDevice: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'RestartDevice'
  }),
  enableRealTimeMode: edge.func({
    assemblyFile: dllPath,
    typeName: 'AnvizDotNetBridge',
    methodName: 'EnableRealTimeMode'
  })
};

// Promise wrappers for the .NET methods
module.exports = {
  connectDevice: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.connectDevice(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  disconnectDevice: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.disconnectDevice(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  getDeviceInfo: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.getDeviceInfo(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  setDeviceTime: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.setDeviceTime(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  getUsers: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.getUsers(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  getUserFingerprints: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.getUserFingerprints(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  registerUser: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.registerUser(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  deleteUser: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.deleteUser(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  enrollFingerprint: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.enrollFingerprint(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  uploadFingerprintTemplate: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.uploadFingerprintTemplate(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  getAttendanceRecords: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.getAttendanceRecords(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  clearAttendanceRecords: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.clearAttendanceRecords(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  unlockDoor: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.unlockDoor(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  restartDevice: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.restartDevice(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  },
  enableRealTimeMode: (params) => {
    return new Promise((resolve, reject) => {
      methodRefs.enableRealTimeMode(params, (error, result) => {
        if (error) reject(error);
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) reject(new Error(parsed.error));
          else resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  }
};