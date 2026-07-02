import 'clock.dart';

class FakeClock implements Clock {
  DateTime _now;

  FakeClock(this._now);

  @override
  DateTime now() => _now;

  void advance(Duration duration) {
    _now = _now.add(duration);
  }

  void setTo(DateTime time) {
    _now = time;
  }
}
