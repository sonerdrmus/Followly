type FlightSlot<T> = {
  current: Promise<T> | null;
};

export function shareInFlight<T>(slot: FlightSlot<T>, start: () => Promise<T>): Promise<T> {
  if (!slot.current) {
    const promise = start().finally(() => {
      if (slot.current === promise) {
        slot.current = null;
      }
    });
    slot.current = promise;
  }

  return slot.current;
}
