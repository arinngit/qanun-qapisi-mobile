import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import { ImagePickerAsset } from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface ProfileImageCropperProps {
  visible: boolean;
  asset: ImagePickerAsset | null;
  onCancel: () => void;
  onComplete: (resultUri: string) => void;
}

const clamp = (value: number, lower: number, upper: number) => {
  "worklet";
  return Math.min(Math.max(value, lower), upper);
};

const MAX_OUTPUT_SIZE = 1024;

export const ProfileImageCropper: React.FC<ProfileImageCropperProps> = ({
  visible,
  asset,
  onCancel,
  onComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const window = Dimensions.get("window");
  const cropSize = useMemo(
    () => Math.min(window.width - 64, 320),
    [window.width]
  );

  const cropSizeValue = useSharedValue(cropSize);
  const imageWidth = useSharedValue(0);
  const imageHeight = useSharedValue(0);
  const minScale = useSharedValue(1);
  const maxScale = useSharedValue(5);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => {
    cropSizeValue.value = cropSize;
  }, [cropSize, cropSizeValue]);

  useEffect(() => {
    if (!asset || !asset.width || !asset.height || !visible) {
      return;
    }

    imageWidth.value = asset.width;
    imageHeight.value = asset.height;
    cropSizeValue.value = cropSize;

    // Görüntüyü crop alanına sığdır - uzun resimler için düzeltme
    const widthScale = cropSize / asset.width;
    const heightScale = cropSize / asset.height;
    // Uzun resimlerde (portrait) height scale daha büyük olacak
    // Kare resimlerde width scale daha büyük olacak
    const initialScale = Math.max(widthScale, heightScale);

    // Minimum scale - görüntü crop alanını tamamen doldurmalı
    const minInitialScale = Math.max(widthScale, heightScale);

    scale.value = initialScale;
    savedScale.value = initialScale;
    minScale.value = minInitialScale;
    maxScale.value = minInitialScale * 5;
    translationX.value = 0;
    translationY.value = 0;
    startX.value = 0;
    startY.value = 0;
  }, [asset, cropSize, visible, cropSizeValue]);

  const getBoundX = () => {
    "worklet";
    const currentCropSize = cropSizeValue.value;
    const scaledWidth = imageWidth.value * scale.value;
    if (scaledWidth <= currentCropSize) {
      return 0;
    }
    return (scaledWidth - currentCropSize) / 2;
  };

  const getBoundY = () => {
    "worklet";
    const currentCropSize = cropSizeValue.value;
    const scaledHeight = imageHeight.value * scale.value;
    if (scaledHeight <= currentCropSize) {
      return 0;
    }
    return (scaledHeight - currentCropSize) / 2;
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX(Platform.OS === "android" ? [-5, 5] : [-10, 10])
    .activeOffsetY(Platform.OS === "android" ? [-5, 5] : [-10, 10])
    .failOffsetX(Platform.OS === "android" ? [-30, 30] : [-50, 50])
    .failOffsetY(Platform.OS === "android" ? [-30, 30] : [-50, 50])
    .onBegin(() => {
      startX.value = translationX.value;
      startY.value = translationY.value;
    })
    .onUpdate((event) => {
      // Android'de numberOfPointers bazen undefined olabilir
      const pointerCount = event.numberOfPointers ?? 1;
      if (pointerCount > 1) {
        return;
      }
      const boundX = getBoundX();
      const boundY = getBoundY();
      translationX.value = clamp(
        startX.value + event.translationX,
        -boundX,
        boundX
      );
      translationY.value = clamp(
        startY.value + event.translationY,
        -boundY,
        boundY
      );
    })
    .onEnd(() => {
      startX.value = translationX.value;
      startY.value = translationY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      // Android'de numberOfPointers bazen undefined olabilir
      const pointerCount = event.numberOfPointers ?? 2;
      if (pointerCount < 2) {
        return;
      }
      const nextScale = clamp(
        savedScale.value * event.scale,
        minScale.value,
        maxScale.value
      );
      scale.value = nextScale;

      // Scale değiştiğinde translation'ı sınırla
      const boundX = getBoundX();
      const boundY = getBoundY();
      translationX.value = clamp(translationX.value, -boundX, boundX);
      translationY.value = clamp(translationY.value, -boundY, boundY);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      startX.value = translationX.value;
      startY.value = translationY.value;
    });

  // Android için gesture'ları daha iyi çalıştırmak için Simultaneous kullan
  // Race yerine Simultaneous kullanıyoruz çünkü hem pan hem pinch aynı anda çalışabilmeli
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedImageStyle = useAnimatedStyle(() => {
    const currentCropSize = cropSizeValue.value;
    const scaledWidth = imageWidth.value * scale.value;
    const scaledHeight = imageHeight.value * scale.value;

    return {
      width: scaledWidth,
      height: scaledHeight,
      transform: [
        {
          translateX:
            -scaledWidth / 2 + currentCropSize / 2 + translationX.value,
        },
        {
          translateY:
            -scaledHeight / 2 + currentCropSize / 2 + translationY.value,
        },
      ],
    };
  });

  const handleReset = () => {
    if (!asset || !asset.width || !asset.height) {
      return;
    }

    const currentCropSize = cropSizeValue.value;
    const widthScale = currentCropSize / asset.width;
    const heightScale = currentCropSize / asset.height;
    const initialScale = Math.max(widthScale, heightScale);

    scale.value = withSpring(initialScale, {
      damping: 15,
      stiffness: 150,
    });
    savedScale.value = initialScale;
    translationX.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
    translationY.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
    startX.value = 0;
    startY.value = 0;
  };

  const handleConfirm = async () => {
    if (!asset || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const currentScale = scale.value;
      const currentTranslationX = translationX.value;
      const currentTranslationY = translationY.value;
      const currentCropSize = cropSizeValue.value;

      // Görüntünün ekrandaki boyutları
      const displayedWidth = asset.width * currentScale;
      const displayedHeight = asset.height * currentScale;

      // Görüntünün crop area içindeki konumu
      // Görüntü merkezlenmiş: (-scaledWidth/2 + cropSize/2 + translationX, ...)
      // Crop area: (0, 0) to (cropSize, cropSize)
      // Görüntünün sol üst köşesi crop area koordinatlarında
      const imageLeftInCrop =
        -displayedWidth / 2 + currentCropSize / 2 + currentTranslationX;
      const imageTopInCrop =
        -displayedHeight / 2 + currentCropSize / 2 + currentTranslationY;

      // Crop area'nın görüntü üzerindeki konumu (orijinal görüntü koordinatları)
      // Crop area sol üst köşesi (0, 0) görüntü koordinatlarında nerede?
      const cropOriginX = Math.max(0, (0 - imageLeftInCrop) / currentScale);
      const cropOriginY = Math.max(0, (0 - imageTopInCrop) / currentScale);
      const cropSizePixels = currentCropSize / currentScale;

      // Crop boyutlarını sınırla - uzun resimler için düzeltme
      const maxCropWidth = asset.width - cropOriginX;
      const maxCropHeight = asset.height - cropOriginY;
      const cropWidth = Math.min(cropSizePixels, maxCropWidth);
      const cropHeight = Math.min(cropSizePixels, maxCropHeight);

      // Minimum boyut kontrolü
      if (cropWidth <= 0 || cropHeight <= 0) {
        throw new Error("Invalid crop dimensions");
      }

      // Kare crop için minimum boyutu kullan
      const minDimension = Math.min(cropWidth, cropHeight);
      if (minDimension <= 1) {
        throw new Error("Insufficient crop size");
      }
      const finalSize = Math.min(MAX_OUTPUT_SIZE, minDimension);

      // Kare crop için - minDimension kullan
      const squareCropSize = Math.min(cropWidth, cropHeight);
      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [
          {
            crop: {
              originX: Math.floor(cropOriginX),
              originY: Math.floor(cropOriginY),
              width: Math.floor(squareCropSize),
              height: Math.floor(squareCropSize),
            },
          },
          {
            resize: { width: finalSize, height: finalSize },
          },
        ],
        {
          compress: 0.85,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      onComplete(manipulated.uri);
    } catch (error) {
      console.error("Image cropping failed:", error);
      // Hata durumunda da callback çağır ama orijinal görüntüyü gönder
      onComplete(asset.uri);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!asset) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={[styles.container, { width: window.width - 32 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Şəkli kəs</Text>
            <TouchableOpacity
              onPress={onCancel}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Crop Area */}
          <View style={styles.cropWrapper}>
            <View
              style={[
                styles.cropArea,
                {
                  width: cropSize,
                  height: cropSize,
                },
              ]}
            >
              <View style={styles.imageContainer} collapsable={false}>
                <GestureDetector gesture={composedGesture}>
                  <Animated.View
                    style={styles.gestureWrapper}
                    collapsable={false}
                  >
                    <Animated.Image
                      source={{ uri: asset.uri }}
                      style={[styles.image, animatedImageStyle]}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </GestureDetector>
              </View>

              {/* Grid Overlay */}
              <View style={styles.overlay}>
                {/* Corner indicators */}
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />

                {/* Grid lines - Rule of Thirds */}
                <View style={styles.gridContainer}>
                  <View
                    style={[
                      styles.gridLine,
                      styles.gridLineVertical,
                      { left: "33.33%" },
                    ]}
                  />
                  <View
                    style={[
                      styles.gridLine,
                      styles.gridLineVertical,
                      { left: "66.66%" },
                    ]}
                  />
                  <View
                    style={[
                      styles.gridLine,
                      styles.gridLineHorizontal,
                      { top: "33.33%" },
                    ]}
                  />
                  <View
                    style={[
                      styles.gridLine,
                      styles.gridLineHorizontal,
                      { top: "66.66%" },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <Text style={styles.instruction}>
            Şəkli böyütmək və yerdəyişmək üçün sürüşdürün və böyütün
          </Text>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={handleReset}
              disabled={isProcessing}
            >
              <Ionicons name="refresh-outline" size={18} color="#6B7280" />
              <Text style={styles.buttonSecondaryText}>Sıfırla</Text>
            </TouchableOpacity>

            <View style={styles.buttonsRight}>
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={onCancel}
                disabled={isProcessing}
              >
                <Text style={styles.buttonCancelText}>İmtina</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.buttonPrimary,
                  isProcessing && styles.buttonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    <Text style={styles.buttonPrimaryText}>Təsdiqlə</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  cropWrapper: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  cropArea: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1F2937",
    position: "relative",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  gestureWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },
  topLeft: {
    top: -1,
    left: -1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -1,
    right: -1,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -1,
    left: -1,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -1,
    right: -1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
  },
  gridLineVertical: {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  gridLineHorizontal: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  instruction: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  buttonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  buttonSecondaryText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buttonCancel: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonCancelText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#7313e8",
    borderRadius: 12,
    minWidth: 120,
    justifyContent: "center",
  },
  buttonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
