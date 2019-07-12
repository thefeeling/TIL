# Flowable과 Observable의 생성 연산자
## Rx에서의 연산자 분류는?
RxJava와 RxKotlin는 Reactive Stream 구현체에 해당하는 `Flowable`과 `Observable`을 생성 할 수 있는 다양한 연산자를 제공하고 있는데, 생성하는 연산자뿐만 아니라 `변환`, `필터`, `결합`, `상태통지`, `집계` 등의 다양한 연산자를 제공하고 있다. 다양한 연산자는 메서드체인(MethodChain) 혹은 FluentAPI 방식으로 실제 소비자에게 전달해야 하는 최종 형태의 데이터로 쉽게 변환이 가능하다. 연산자의 종류별로 기본적으로 실행하는 스레드가 달라질 수 있으며, 이에 대한 지정은 별도 스캐줄러 지정을 통하여 변경이 가능하다.

연산자에 대한 자세한 분류는 [링크](http://reactivex.io/documentation/operators.html)를 통하여 확인이 가능하다. 불행한(?) 사실은 RxJava의 경우 2.0 버젼에 해당하는 문서화가 완벽하게 안되어 있음을 확인 할 수 있다. 대부분은 플로우는 다른 구현체의 마블다이어그램을 통하여 확인 할 수 있으니 크게 상관하지 않아도 될듯 싶다.

## 생성 연산자
말 그대로 Flowable과 Observable을 생성하는 연산자이다. 연산자의 종류는 아래와 같다.
- create
- just
- fromArray
- fromIterable
- fromCallable
- interval
- timer
- error
