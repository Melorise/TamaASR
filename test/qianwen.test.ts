import assert from 'node:assert/strict';
import test from 'node:test';
import { qianwenAdapter } from '../src/backends/qianwen';
import { shouldClickMicrophoneOnStop } from '../src/preload/speech-session-state';

function microphone(className: string, attributes: Record<string, string | undefined> = {}): HTMLElement {
  return {
    classList: { contains: (token: string) => className.split(/\s+/).includes(token) },
    getAttribute: (name: string) => name === 'class' ? className : attributes[name] ?? null,
    querySelector: () => null,
    textContent: ''
  } as unknown as HTMLElement;
}

test('千问新版录音样式允许点击停止，恢复空闲样式后不再判为录音', () => {
  let control = microphone('cursor-pointer hover:bg-tag');
  const adapter = { ...qianwenAdapter, findMicrophone: () => control };
  const document = {} as Document;
  assert.equal(adapter.isRecording(document), false);

  control = microphone('pointer-events-auto cursor-pointer bg-tag');
  assert.equal(adapter.isRecording(document), true);
  assert.equal(shouldClickMicrophoneOnStop(adapter.isRecording(document), false), true);
  assert.equal(shouldClickMicrophoneOnStop(adapter.isRecording(document), true), false);

  control = microphone('cursor-pointer hover:bg-tag');
  assert.equal(adapter.isRecording(document), false);
});

test('千问旧版 aria 和停止文案保持兼容', () => {
  for (const attributes of [{ 'aria-pressed': 'true' }, { 'aria-label': '停止语音' }]) {
    const adapter = { ...qianwenAdapter, findMicrophone: () => microphone('', attributes) };
    assert.equal(adapter.isRecording({} as Document), true);
  }
  const adapter = { ...qianwenAdapter, findMicrophone: () => null };
  assert.equal(adapter.isRecording({} as Document), false);
});
