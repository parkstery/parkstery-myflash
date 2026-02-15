
package com.smartflash.control;

import android.content.Context;
import android.hardware.camera2.CameraAccessException;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Flash")
public class FlashPlugin extends Plugin {

    private String cameraId;
    private CameraManager cameraManager;

    @Override
    public void load() {
        cameraManager = (CameraManager) getContext().getSystemService(Context.CAMERA_SERVICE);
        try {
            for (String id : cameraManager.getCameraIdList()) {
                CameraCharacteristics characteristics = cameraManager.getCameraCharacteristics(id);
                Boolean hasFlash = characteristics.get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                if (hasFlash != null && hasFlash) {
                    cameraId = id;
                    break;
                }
            }
        } catch (CameraAccessException e) {
            e.printStackTrace();
        }
    }

    @PluginMethod
    public void toggle(PluginCall call) {
        boolean state = call.getBoolean("state", false);
        try {
            if (cameraId != null) {
                cameraManager.setTorchMode(cameraId, state);
                call.resolve();
            } else {
                call.reject("Flash not available");
            }
        } catch (Exception e) {
            call.reject(e.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void setBrightness(PluginCall call) {
        int levelInput = call.getInt("level", 100);
        try {
            if (cameraId != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    // API 33 이상: 하드웨어 레벨 제어 지원
                    CameraCharacteristics characteristics = cameraManager.getCameraCharacteristics(cameraId);
                    Integer maxLevel = characteristics.get(CameraCharacteristics.FLASH_SINGLE_STRENGTH_MAX_LEVEL);
                    
                    if (maxLevel != null && maxLevel > 1) {
                        // 1% 단위를 하드웨어 레벨로 매핑
                        int actualLevel = (int) Math.max(1, (levelInput / 100.0) * maxLevel);
                        cameraManager.setTorchModeWithLevel(cameraId, actualLevel);
                    } else {
                        // 레벨 제어 미지원 기기는 On/Off로 대체
                        cameraManager.setTorchMode(cameraId, true);
                    }
                } else {
                    // API 33 미만: On/Off만 가능
                    cameraManager.setTorchMode(cameraId, true);
                }
                call.resolve();
            } else {
                call.reject("Flash not available");
            }
        } catch (Exception e) {
            call.reject(e.getLocalizedMessage());
        }
    }
}
