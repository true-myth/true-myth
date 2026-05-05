export default interface MyType<T, E> {
  readonly value: T;
  readonly error?: E;
}
