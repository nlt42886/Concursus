import { StyleSheet, Dimensions, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useHaptics } from '../../hooks/useHaptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COMPLETE_THRESHOLD = 80;
const DELETE_THRESHOLD = -80;

interface SwipeableRowProps {
  children: React.ReactNode;
  onComplete?: () => void;
  onDelete?: () => void;
  completedLabel?: string;
  deleteLabel?: string;
}

export default function SwipeableRow({
  children,
  onComplete,
  onDelete,
  completedLabel = '✓ Done',
  deleteLabel = '🗑 Delete',
}: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const completeBg = useSharedValue(0);
  const deleteBg = useSharedValue(0);
  const haptics = useHaptics();
  let didHaptic = false;

  const triggerComplete = () => {
    haptics.success();
    onComplete?.();
  };

  const triggerDelete = () => {
    haptics.heavy();
    onDelete?.();
  };

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      const tx = Math.max(DELETE_THRESHOLD * 2, Math.min(COMPLETE_THRESHOLD * 2, e.translationX));
      translateX.value = tx;
      completeBg.value = Math.min(1, tx / COMPLETE_THRESHOLD);
      deleteBg.value = Math.min(1, -tx / -DELETE_THRESHOLD);

      // Preview haptic at threshold
      if ((tx > COMPLETE_THRESHOLD || tx < DELETE_THRESHOLD) && !didHaptic) {
        didHaptic = true;
        runOnJS(haptics.medium)();
      } else if (tx <= COMPLETE_THRESHOLD && tx >= DELETE_THRESHOLD) {
        didHaptic = false;
      }
    })
    .onEnd((e) => {
      if (e.translationX > COMPLETE_THRESHOLD && onComplete) {
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 250 }, () => {
          runOnJS(triggerComplete)();
        });
      } else if (e.translationX < DELETE_THRESHOLD && onDelete) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 250 }, () => {
          runOnJS(triggerDelete)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
        completeBg.value = withSpring(0);
        deleteBg.value = withSpring(0);
      }
    });

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const completeRevealStyle = useAnimatedStyle(() => ({
    opacity: completeBg.value,
  }));

  const deleteRevealStyle = useAnimatedStyle(() => ({
    opacity: deleteBg.value,
  }));

  return (
    <View style={styles.container}>
      {/* Complete action background */}
      {onComplete && (
        <Animated.View style={[styles.actionLeft, completeRevealStyle]}>
          <Text style={styles.actionText}>{completedLabel}</Text>
        </Animated.View>
      )}
      {/* Delete action background */}
      {onDelete && (
        <Animated.View style={[styles.actionRight, deleteRevealStyle]}>
          <Text style={styles.actionText}>{deleteLabel}</Text>
        </Animated.View>
      )}
      {/* Row content */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.row, animatedRowStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  actionLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#34C759',
    justifyContent: 'center',
    paddingLeft: 20,
  },
  actionRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  actionText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  row: {
    backgroundColor: 'transparent',
  },
});
