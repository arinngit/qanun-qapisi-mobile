import { useTheme } from "@/context/theme-context";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Keyboard, StyleSheet, Text, View } from "react-native";

type SheetType = "form" | "list" | "confirm";

interface GBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  type?: SheetType;
  children: React.ReactNode;
}

const GBottomSheet: React.FC<GBottomSheetProps> = ({
  visible,
  onClose,
  title,
  type = "form",
  children,
}) => {
  const sheetRef = useRef<BottomSheet>(null);
  const { isDark, colors } = useTheme();

  const snapPoints = useMemo(() => {
    switch (type) {
      case "list":
        return ["50%", "75%"];
      case "confirm":
        return ["25%", "35%"];
      default:
        return ["45%", "75%", "90%"];
    }
  }, [type]);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
      Keyboard.dismiss();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        Keyboard.dismiss();
        handleClose();
      }
    },
    [handleClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const dynamicStyles = useMemo(
    () => ({
      container: {
        ...styles.container,
        backgroundColor: colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      },
      title: {
        ...styles.title,
        color: colors.text,
      },
      handle: {
        backgroundColor: isDark ? "#4B5563" : "#D1D5DB",
      },
    }),
    [colors, isDark]
  );

  const keyboardBehavior = type === "form" ? "extend" : "interactive";
  const enableContentPanningGesture = type !== "form";

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={dynamicStyles.container}
      handleIndicatorStyle={dynamicStyles.handle}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enableOverDrag={false}
      animateOnMount={true}
      enableContentPanningGesture={enableContentPanningGesture}
      activeOffsetY={[-1, 1]}
      failOffsetX={[-5, 5]}
    >
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.scrollContent,
          type === "form" && styles.formScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={true}
      >
        {title ? <Text style={dynamicStyles.title}>{title}</Text> : null}
        <View style={[styles.content, type === "list" && styles.listPadding]}>
          {children}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  formScrollContent: {
    paddingBottom: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  listPadding: {
    paddingTop: 0,
  },
});

export default GBottomSheet;
