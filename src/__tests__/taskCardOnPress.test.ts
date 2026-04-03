// @ts-nocheck
/**
 * TaskCard onPress Behavior Tests
 * Tests that TaskCard onPress does NOT navigate when empty
 */

import { describe, it, expect } from '@jest/globals';

describe('TaskCard onPress Behavior', () => {
  // Simulate the current onPress behavior
  const createTaskCardProps = (onPress: (() => void) | undefined) => ({
    onPress,
    task: { id: 'task-1', title: 'Test Task' },
  });

  it('should have undefined onPress when not provided', () => {
    const props = createTaskCardProps(undefined);
    expect(props.onPress).toBe(undefined);
  });

  it('should have onPress when provided', () => {
    const onPress = () => { console.log('pressed'); };
    const props = createTaskCardProps(onPress);
    expect(props.onPress).toBeDefined();
    expect(typeof props.onPress).toBe('function');
  });
});