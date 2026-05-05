export interface MyType<T, E> {
  readonly value: T;
  readonly error?: E;
}

export interface MyTask<T, E> {
  readonly value: T;
  readonly error?: E;
}

export interface Res<T, E> {
  readonly value: T;
  readonly error?: E;
}
