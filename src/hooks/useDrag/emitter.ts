type Event = {
  name: string
  payload: unknown
}

/**
 * Type-safe Emitter class for managing event subscriptions.
 *
 * Usage:
 *  type CakeEvents = { name: 'baked'; payload: string } | { name: 'eaten'; payload: { slices: number } }
 *
 *  export class Cake extends Emitter<CakeEvents> {
 *    public eatSlices(amount: number): void {
 *      this.emit('eaten', { slices: amount })
 *    }
 *  }
 *1
 *  const cake = new Cake()
 *  cake.on('eaten', (info) => {
 *    console.log('Someone ate ', info.slices, ' slices of cake')
 *  })
 */
export class Emitter<T extends Event> {
  private _listeners: Map<string, ((args: Event['payload']) => void)[]> = new Map()

  public on<Type extends T['name']>(
    ...args: Extract<T, { name: Type }> extends { payload: infer TPayload }
      ? [name: Type, listener: (payload: TPayload) => void]
      : [name: Type, listener: () => void]
  ): (payload?: unknown) => void {
    const listeners = this._listeners.get(args[0]) || []

    listeners.push(args[1])

    this._listeners.set(args[0], listeners)

    return args[1]
  }

  public off<Type extends T['name']>(
    ...args: Extract<T, { name: Type }> extends { payload: infer TPayload }
      ? [name: Type, listener: (payload: TPayload) => void]
      : [name: Type, listener: () => void]
  ): void {
    const listeners = this._listeners.get(args[0]) || []

    this._listeners.set(
      args[0],
      listeners.filter((l) => l !== args[1])
    )
  }

  protected emit<Type extends T['name']>(
    ...args: Extract<T, { name: Type }> extends { payload: infer TPayload }
      ? [name: Type, payload: TPayload]
      : [name: Type]
  ): void {
    const listeners = this._listeners.get(args[0]) || []

    if (args[1]) {
      listeners.forEach((listener) => listener(args[1]))
    }
  }

  public unsubscribeAll(): void {
    this._listeners.clear()
  }
}
