class DomainException implements Exception {
  final String message;
  const DomainException(this.message);

  @override
  String toString() => 'DomainException: $message';
}

class InvalidWordException extends DomainException {
  const InvalidWordException(super.message);
  @override
  String toString() => 'InvalidWordException: $message';
}

class InvalidWordExampleException extends DomainException {
  const InvalidWordExampleException(super.message);
  @override
  String toString() => 'InvalidWordExampleException: $message';
}

class InvalidWordDerivativeException extends DomainException {
  const InvalidWordDerivativeException(super.message);
  @override
  String toString() => 'InvalidWordDerivativeException: $message';
}

class InvalidWordRootException extends DomainException {
  const InvalidWordRootException(super.message);
  @override
  String toString() => 'InvalidWordRootException: $message';
}
