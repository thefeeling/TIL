# 네트워크


### TCP와 UDP의 차이에 대해 설명하시오
- 둘다 패킷을 주고 받는 점은 동일하지만, TCP는 전송 받은 패킷에 대해 체크섬 값을 기준으로 정합성을 체크하고 잘못들어오거나 손상된 패킷에 대해서는 재전송을 요구함. UDP는 재전송을 요구하지 않음.

### HTTP와 TCP의 관계에 대해 설명하시오.
- HTTP는 TCP보다 고수준/상위 레이어의 프로토콜로 HTTP에서도 실제 통신을 할 때 TCP를 사용하여 통신하게 된다.

### HTTP와 HTTPS에 차이와 HTTPS에서 S는 어떤 계층에 속했는지 설명하시오.
- SSL 프로토콜은 OSI 7계층 모델의 어느 한 계층에 속해서 동작하는 것이 아니라, 응용계층과 전송계층 사이에 독립적인 프로토콜 계층을 만들어서 동작하며, 이 때, 응용계층의 프로토콜들은 외부로 보내는 데이터를 TCP가 아닌 SSL에 보내게 되고,SSL은 받은 데이터를 암호화하여 TCP에 보내어 외부 인터넷으로 전달하게 됩니다. 전달 받을 때 역시, TCP로부터 받은 데이터를 복호화하여 응용계층에 전달하게 되는데, 이 과정에서 Application은 SSL을 TCP로 인식하고, TCP는 SSL을 Application으로 인식하기 때문에, Application과 TCP사이의 데이터 전달 방식은 기존 전달 방식을 그대로 사용하게 됩니다.
 
### REST와 SOAP에 대해 설명하시오.

### 쿠키와 세션에 대해 설명해주세요.
- 서버에서 클라이언트를 식별하고 상태 값을 저장하기 위해 클라이언트에 쿠키를 생성하여 보내주며, 이를 받은 클라이언트(대부분은 브라우저)는 이 값을 매 전송때마다 보내게 된다. 보통 쿠키 값은 도메인에 의존적이며 도메인이 다를 경우 서버에서 
CORS에 대한 정책을 수립하고 사용은 할 수 있다.

### 샤딩이란 무엇인가요?

### 3way handshake와 4way handshake를 설명해주세요.
- 

### TCP와 IP에 대해 설명해주세요.
- 물리 레벨에서 실제 장비를 식별할 수 있는 고유한 값이 IP이며 현재 IP/v4를 대부분 사용하고 있고, IP 개수가 모자라는 문제가 있어 추후에는 IP/v6로 넘어갈듯 하다. TCP의 경우 전송 레벨의 프로토콜로 물리 레벨의 IP보다 상위에 존재하고 있으며 데이터 패킷의 전송을 담당하고 있다. 패킷의 경우 하위 레이어로 내려가면서 해당 물리 레벨에 맞도록 데이터가 변환되며 전송/수신측에서도 상위레이어로 올라가면서 패킷으로 바뀌고 데이터로 바뀌게 된다.
### HTTP Method에 대해 설명해주세요.
1. HTTP Method를 통하여 해당 URI의 자원에 대해 어떤 행위를 할 것인지를 명시
	| Method  | 설명  |
	|---|---|
	| GET  | 데이터 조회 시 사용.  |
	| POST  | 데이터 생성 시 사용  |
	| PUT  | 데이터 생성 혹은 업데이트 시 사용  |
	| DELETE  | 데이터 삭제 시 사용  |
	| PATCH  | 데이터의 부분 업데이트 시 사용  |
	| OPTION  | CORS Preflight 요청 시 사용  |



### Connection Timeout/Read Timeout의 차이는?
- Connection Timeout의 경우 연결 자체를 실패 할 경우를 말하게 되며, Connection을 구성하는데 소요되는 시간의 임계치를 의미합니다.

- Read Timeout의 경우 Socket Timeout과 용어를 혼용해서 사용하는 것이 아닌가 싶은데, 일단 서버와 클라이언트가 연결을 수립하고 패킷을 주거니 받거니 하는 과정에서 임계치 이상의 시간을 대기할 경우 발생하는 것이 Read Timeout이라고 볼 수 있음.
- 링크
	- [CONNECTION TIMEOUT과 READ TIMEOUT 차이 쉽게 정리](https://inyl.github.io/programming/2017/12/02/timeout.html)
	- [ConnectionTimeout과 SocketTimeout의 차이](http://tomining.tistory.com/164)

### Restful 하지 않다는 것은 무슨 의미인가요?
- 자원을 URI로 식별하지 않거나 URI에 동사를 포함하고 있거나 무분별하게 POST등을 사용하는 경우가 Restful하지 않은 대표적인 사용 케이스이다. 결국 Restful하다는 뜻은 HTTP 표준 스펙을 최대한 잘 준수하고 HTTP Method, URI를 자원에 잘 매핑하여 식별하는 것이 중요하다고 생각.

### CORS에 대해 설명해보세요
- 브라우저에서는 기본적으로 다른 도메인의 리소스를 접근이 가능하다. 하지만 `<script>`로 둘러 쌓여 있는 스크립트에서는 `same-origin-policy`정책을 적용 받기 떄문에 다른 도메인에 대해 `Cross-Site-Requeest`가 불가능하다. 이런 제약 조건을 해결하기 위해 나온 표준안이 `CORS`이다.
- Simple/Preflight, Credential/Non-Credential로 나뉨
- Simple 요청이 아닌 경우 모두 Preflight 요청이며 Preflight의 경우 예비 요청을 보내고 본 요청을 보낸다. Preflight 요청의 경우 대부분의 HTTP Method, Headers 등을 커스텀하게 사용하는 것이 가능하며, Simple의 경우 제약조건이 쫌 많은편이다.
- Credential의 경우, HTTP Cookie와 HTTP Authentication 정보를 읽을 수 있도록 요청. xhr의 구현에서 withCredential의 옵션을 활성화시켜야되며 서버측 response header에서 access-control-allow-credential 옵션을 true로 활성화 시켜야 한다.
- 서버측에서는 일반적으로 접근 가능한 도메인과 메소드등을 헤더에 명시해줘야 클라이언트에서 해당 헤더 정보를 읽어서 CORS를 활성화 시킬 수 있다.
- 링크
	- [Cross Origin Resource Sharing - CORS ](https://homoefficio.github.io/2015/07/21/Cross-Origin-Resource-Sharing/)