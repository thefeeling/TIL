Netty-In-Action
----

# 1부, 네티 개념과 아키텍처

## 1장. 네티: 비동기 이벤트 기반 네트워킹 프레임워크
- 최초 자바 API(java.net)은 네이티브 시스템 소켓 라이브러리가 제공하는 블로킹 함수만 제공
  - 다수의 클라이언트를 관리하려면 새로운 클라이언트 소켓마다 새로운 스레드를 할당해야 함.
  - 여러 스레드가 입출력 데이터를 무한정 대기하는 상태가 유지될 수 있고, 이는 곧 리소스에 대한 낭비로 이어질 수 있음.
  - 운영체제에 따라 다르지만 스텍의 기본 크기는 64KB ~ 1MB까지 차지할 수 있다. JVM이 많은 수의 스레드 생성을 지원하지만, 동시 접속이 한계에 이르는 순간(1만개 전후) 컨텍스트 스위칭에 따른 오버헤드가 심각한 문제가 될수 있다.
- 네이티브 소켓 라이브러리에는 오래전부터 네트워크 리소스 사용률을 세부적으로 제어할수 있는 논블로킹(non-blocking) 호출이 포함되어 있다.
  - setsockopt() 시스템 함수를 통한 블로킹 콜에 대한 옵션 설정 가능
  - 이벤트 통지 API(epoll/kqueue)를 통하여 논블로킹 소켓의 집합을 등록하면 읽거나 기록할 데이터가 준비됐는지 여부를 알수 있다. [참고](https://long-zhou.github.io/2012/12/21/epoll-vs-kqueue.html)
  - 논블로킹 입출력을 위한 자바의 기능 지원은 1.4부터 java.nio 패키지를 통하여 이뤄졌다.


![java.nio.channels.Selector](https://drek4537l1klr.cloudfront.net/maurer/Figures/01fig02.jpg)
- 자바의 논블로킹 설계의 핵심은 바로 `java.nio.channels.Selector` 클래스이다. 시스템의 이벤트 통지 API를 그대로 사용하며 언제나 읽기/쓰기 작업의 완료 상태를 확인할 수 있으므로 단일 스레드로 여러 동시 연결을 처리할 수 있다.
  - 적은 수의 스레드로 더 많은 연결을 처리할 수 있으므로 컨텍스트 스위칭에 따른 오버헤드와 메모리 관리가 원활해짐
  - 스레드의 상태가 점유가 되어 있지 않기 때문에, 입출력 외에 다른 작업을 사용할 수 있음.

- 네티는 네트워킹 도메인에서 가장 유명한 자바 프레임워크로 기반 구현의 복잡성을 단순한 추상화로 감춰 개발자가 어플리케이션 구현 영역에 집중할 수 있도록 도와준다.
  - 블로킹/논블로킹 방식의 모두 지원
  - 코어 자바 API보다 높은 처리량과 짧은 지연 시간. 풀링/재사용을 통한 리소스 소비 감소, 메모리 복사 최소화

- 이벤트 기반의 비동기식으로 어플리케이션을 작성할때는 특수한 문제에 대한 고려가 필요. 
  - 발생하는 이벤트에 대해 언제든지/순서에 상관없이 응답을 할 수 있음, 이는 곧, `증가하는 처리량에 맞게 시스템/네트워크/프로세스의 능력을 작업량 증가에 맞게 늘리는 능력`으로 정의할 수 있는 최고 수준의 확장성을 갖추는데 필수적임.
  - 논블로킹 네트워크 연결은 작업 완료를 기다릴 필요가 없다. 비동기 코드는 바로 반환을 하며 완료가 되면 추후에 이를 통지하는 방식이다.
  - 셀렉터는 적은 수의 스레드로 여러 연결에서 이벤트를 모니터링 할 수 있게 해줌
	

- 네티의 핵심 컴포넌트
  - Channel
  하나 이상의 입출력 작업(읽기/쓰기)을 수행할수 있는 하드웨어 장치/파일/네트워크 소켓/프로그램 컴포넌트와 같은 엔티티에 대한 열린 연결, 들어오는 Inbound와 나가는 Outbound를 위한 운송수단으로 생각하자
  - Callback
  콜백은 관심 대상에게 작업 완료를 알리는 가장 일반적인 방법으로 네티는 이벤트를 처리할 때 내부적으로 콜백을 이용한다. 콜백 트리거가 되면 ChannelHandler 인터페이스 구현을 통해 이벤트를 처리할수 있다.
  - Future
  퓨처는 작업이 완료되면 어플리케이션에 이를 알리는 방법이다. 비동기 작업의 결과를 접근할 수 있게 해준다. JDK에서는 java.`util.concurrent.Future` 인터페이스를 제공하지만, 해당 구현은 `작업 완료 여부 확인`과 `완료전까지 블록킹`하는 기능만 존재한다. 네티는 이를 개선한 `ChannelFuture`를 사용한다. ChannelFuture에는 ChannelFutureListener 인스턴스를 하나 이상 등록할 수 있으며 완료시점에 operationComplete() 콜백 메소드가 호출이 된다. 해당 콜백 실행 시점에 완료/오류 등을 확인 가능하다.
  네티의 모든 아웃바운드 입출력은 ChannelFuture를 반환하고 진행에 블로킹 작업은 없다. 모든것은 비동기에 이벤트 기반이다.

- 이벤트와 핸들러
네티는 작업 상태 변화를 알리기 위해 고유한 이벤트를 사용한다. `로깅`, `데이터 변환`, `흐름 제어`, `어플리케이션 논리` 등의 동작을 포함한다. 이벤트들은 크게 `인바운드`와 `아웃바운드` 데이터 흐름의 연관성을 기준으로 분류한다.
모든 이벤트는 핸들러 클래스의 사용자 구현 메서드로 전달할 수 있다. **다시 말해, 각 핸들러 인스턴스는 특정 이벤트에 반응하여 실행하는 일종의 콜백이라고 이해하면 된다.**
> * 인바운드: 연결 활성화/비활성화, 데이터 읽기, 사용자 이벤트, 오류 이벤트
> * 아웃바운드: 원격 피어 연결 열기/닫기, 소켓에 데이터 쓰기/플러시



## 2장. 첫 번째 네티 어플리케이션
- 책의 경우 maven 기준으로 설명을 하고 있지만, 예제는 gradle 기반의 프로젝트에서 작성했으며, `4.1.65.Final` 버젼을 기준으로 실습 편의성을 위해 `netty-all` 디펜던시를 참조했다.
```
dependencies {
  implementation 'io.netty:netty-all:4.1.65.Final'
  ...
}
```

#### EchoServer 코드 작성
- 아래 `EchoServer` 및 `EchoServerHandler` 코드 작성 후 기동 
```java
public class EchoServer {
	private final int port;

	public EchoServer(int port) {
		this.port = port;
	}

	public static void main(String[] args) throws InterruptedException {
		if (args.length < 1) {
			System.err.println("Usage: " + EchoServer.class.getSimpleName() + "<port>");
		}
		int port = Integer.parseInt(args[0]);
		new EchoServer(port).start();
	}

	public void start() throws InterruptedException {
		final EchoServerHandler echoServerHandler = new EchoServerHandler();
		EventLoopGroup group = new NioEventLoopGroup();
		try {
			ServerBootstrap b = new ServerBootstrap();
			b.group(group)
				.channel(NioServerSocketChannel.class)
				.localAddress(new InetSocketAddress(port))
				.childHandler(new ChannelInitializer<SocketChannel>() {
					@Override
					protected void initChannel(SocketChannel ch) throws Exception {
						System.out.println("initChannel");
						ch.pipeline().addLast(echoServerHandler);
					}
				});
			ChannelFuture future = b.bind().sync();
			future.channel().closeFuture().sync();
		} finally {
			group.shutdownGracefully().sync();
		}
	}
}
```
- 부트스트랩 하는 코드를 포함하고 있으며, 서버 연결 요청을 수신하는 포트를 서버와 바인딩하는 코드가 있어야 한다.
- NioEventLoopGroup을 통하여 새로운 연결 수락 및 데이터 읽기/쓰기와 같은 이벤트를 처리
- 서버가 바인딩하는 InetSocketAddress를 지정
- 새로운 연결을 수락하고 Channel을 생성 후 ChannelInitializer를 통하여 EchoServerHandler 인스턴스를 Channel의 ChannelPipeline으로 추가한다.
- ServerBootstrap.bind() 호출하여 서버를 바인딩

```java
@Sharable // 여러 Channel에서 공유할 수 있음을 나타나는 마커 인터페이스 
public class EchoServerHandler extends ChannelInboundHandlerAdapter {
@Override
public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
	final ByteBuf in = (ByteBuf) msg;
	System.out.println(
		"Server received: " + in.toString(CharsetUtil.UTF_8)
	);
	ctx.write(in);
}

@Override
public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
	ctx.writeAndFlush(Unpooled.EMPTY_BUFFER)
		.addListener(ChannelFutureListener.CLOSE);
}

@Override
public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
	cause.printStackTrace();
	ctx.close();
}
}
```

- telnet을 통하여 Echo 메세지가 다시 telnet 클라이언트로 다시 전달이 되는지 확인하면 서버 코드 작성은 완료
![텔넷테스트](https://i.imgur.com/jvDaSSu.png)
- 서버에 들어오는 이벤트에 반응해야 하기 때문에 `ChannelInboundHandler` 구현체인 `ChannelInboundHandlerAdapter` 하위 클래스를 만들었고, 여기에 몇개 메소드를 오버라이드하여 메세지를 처리하도록 했다.
  - `channelRead`: 메세지가 들어올때마다 호출
  - `channelReadComplete`: channelRead()의 마지막 호출에서 현재 일괄 처리의 마지막 메세지를 처리했음을 핸들러에 통보
  - `exceptionCaught`: 읽기 처리 중 예외가 발생하면 콜백됨, 예외 처리를 하지 않을 경우 ChannelPipeline의 마지막까지 이동 후 로깅이 되며, 가급적이면 하나 이상의 exceptionCaught를 구현하는 것이 바람직하다고 한다.
- ChannelHandler는 네 가지 이벤트 유형을 제공하며, 어플리케이션은 ChannelHandler을 구현하거나 확장하여 이벤트를 후크하고 어플리케이션 로직을 제공해야 한다. ChannelHandler는 비즈니스 관심사에서 네트워크 관심사를 분리하는 것을 도와준다.

#### EchoClient 코드 작성
- 어플리케이션에서 필요한 `EchoClient`, `EchoClientHandler` 핸들러 코드는 아래와 같다.

```java
@Sharable
public class EchoClientHandler extends SimpleChannelInboundHandler<ByteBuf> {
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        ctx.writeAndFlush(
		Unpooled.copiedBuffer("Netty rocks!", CharsetUtil.UTF_8)
        );
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, ByteBuf msg) throws Exception {
        System.out.println(
                "Client received: " + msg.toString(CharsetUtil.UTF_8)
        );
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}
```

![ChannelHandler_Hierachy](https://i.imgur.com/VrnfrIE.png)
- 서버와 마찬가지로 EchoClientHandler는 `ChannelInboundHandler` 인터페이스의 구현체인 `SimpleChannelInboundHandler`의 메소드를 오버라이드하여 필요한 작업을 처리한다.
  - `channelActive()`: 서버 연결 후 콜백
  - `channelRead0()`: 서버에서 메세지 수신 후 콜백
  - `exceptionCaught()`: 처리 중 예외 시 콜백
- `channelRead0()`에서 주의할 점은 전체 바이트 데이터 수신를 한 번에 수신한다는 보장이 없다. 경우에 따라 `channelRead0()` 메소드가 여러번 호출될 수 있다. 대신, TCP는 스트림 기반 프로토콜이므로 서버에서 보낸 순서대로 바이트 수신을 보장한다.
  > 예시) AB|CDE|FG, ABC|DE|FG, AB|CD|EFG 와 같은 형태로 바이트를 수신할 수도 있다는 이야기이다.

```java
public class EchoClient {
    private final String host;
    private final int port;

    public EchoClient(String host, int port) {
        this.port = port;
        this.host = host;
    }

    public void start() throws InterruptedException {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
                    .channel(NioSocketChannel.class)
                    .remoteAddress(new InetSocketAddress(host, port))
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline()
				    	.addLast(new EchoClientHandler());
                        }
                    });
            ChannelFuture f = b.connect().sync();
            f.channel().closeFuture().sync();
        } finally {
            group.shutdownGracefully().sync();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        if (args.length < 1) {
            System.err.println(
                    "Usage: " + EchoClient.class.getSimpleName() + "<host> <port>"
            );
        }
        String host = args[0];
        int port = Integer.parseInt(args[1]);
        new EchoClient(host, port).start();
    }
}
```

## 3장. 네티 컴포넌트와 설계
### Channel, EventLoop, ChannelFuture
- Channel: Socket
- EventLoop: 제어 흐름, 멀티스레딩, 동시성 제어
- ChannelFuture: 비동기 결과 알림

#### Channel 인터페이스
![Channel_Hierachy](https://i.imgur.com/Ovv6kg2.png)
> 실제 구현 클래스와 인터페이스 종류는 더 다양하다.
- `Channel` 인터페이스는 Socket으로 직접 작업할 때의 복잡성을 크게 완화하는 API를 제공

#### EventLoop 인터페이스
![EventLoop](https://i.imgur.com/rF7huZs.png)
- 연결 수명주기 중 발생하는 이벤트를 처리하는 핵심 추상화 인터페이스

![EventLoop](https://drek4537l1klr.cloudfront.net/maurer/Figures/03fig01.jpg)
> 출처: Netty-In-Action

- `Channel` - `EventLoop` - `Thread` - `EventLoopGroup` 사이에서의 상호작용은 아래와 같다
  - 한 `EventLoopGroup`은 하나 이상의 EventLoop를 포함
  - 한 `EventLoop`는 수명주기 동안 하나의 스레드에 바인딩
  - 한 `EventLoop`에서 처리되는 모든 입출력은 전용 스레드에서 처리
  - 한 `Channel`은 수명주기 동안 EventLoop에 등록
  - 한 `EventLoop`는 하나 이상의 Channel로 할당 가능

#### ChannelHandler와 ChannelPipeline
![ChannelHandler](https://drek4537l1klr.cloudfront.net/maurer/Figures/03fig02.jpg)
- `ChannelHandler` 인터페이스
네티의 핵심 컴포넌트로 인바운드와 아웃바운드 데이터의 처리에 적용되는 모든 어플리케이션 논리를 처리하는 컨테이너 역할을 수행. 네트워크 이벤트에 의해 트리거되며 데이터를 변환하거나 예외처리하는 등의 모든 종류의 작업에 활용 가능하다.

![ChannelPipeline](https://drek4537l1klr.cloudfront.net/maurer/Figures/03fig03_alt.jpg)
- `ChannelPipeline` 인터페이스
  - `ChannelPipeline`은 `ChannelHandler` 체인을 위한 컨테이너를 제공.
  - 체인에서 인바운드/아웃바운드 이벤트를 전파하는 API를 정의한다.
  - `ChannelHandler`는 아래와 같은 과정으로 `ChannelPipeline`에 설치
    - `ChannelInitializer` 구현은 ServerBootstrap에 등록
    - `ChannelInitializer.initChannel()`을 호출하면 ChannelInitializer가 ChannelHandler의 커스텀 집합을 파이프라인에 설치
    - `ChannelInitializer`는 `ChannelPipeline`에서 자신을 제거
  - 파이프라인을 통해 이벤트를 전달하는 역할은 `ChannelHandler`가 담당하며, 핸들러 객체는 이벤트를 수신하고 로직을 실행하며 체인상의 다음 핸들러로 데이터를 전달한다.
  - 위 이미지에서 볼수 있듯이 인바운드/아웃바운드 핸들러는 같은 파이프라인에 설치가 가능하며 메세지/이벤트를 읽을 떄는 파이프라인 앞쪽에서 시작하며 체인상의 다음 ChannelInboundHandler로 데이터를 전달한다. 최종적으로 데이터가 파이프라인 뒤쪽에 이르면 모든 처리가 종료된다.
  - 아웃바운드도 개념은 동일하며, 체인상에서 뒤쪽에서 시작하여 앞쪽에 이를 때까지 이동한다. Socket으로 나오는 부분에 도달하면 쓰기 작업이 트리거된다.
  - 인바운드/아웃바운드 모두 ChannelHandler를 확장하지만, ChannelInboundHandler와 ChannelOutboundHandler의 구현을 구분하여 데이터 전달이 동일한 방향으로 수행되도록 보장한다.
  - ChannelHandler를 하나 추가할 때 ChannelHandler와 ChannelPipeline의 바인딩을 나타내는 ChannelHandlerContext 하나가 할당된다. 
  - 네티에서는 메세지를 보내는 데 Channel에 직접할 기록하는 방법과 ChannelHandler와 연결된 ChannelHandlerContext 객체에 기록하는 두 가지 방법이 존재한다. 전자는 ChannelPipeline 뒤쪽에서 시작되며, 후자의 방법은 메세지가 ChannelPipeline의 다음 핸들러에서 시작된다.

#### ChannelHandler에 대한 고찰
- 네티는 비즈니스 로직을 쉽게 개발할 수 있도록 어댑터 클래스의 형태로 여러 기본 핸들러를 제공
- 파이프라인의 각 핸들러는 체인의 다음 핸들러로 전달해야 하는데, 어댑터 클래스는 이 작업을 자동으로 해주고 특수한 동작이 필요한 메서드와 이벤트만 재정의할 수 있다.
- 가장 자주 사용할 어댑터는 아래와 같다
  - `ChannelHandlerAdapter`
  - `ChannelInboundHandlerAdapter`
  - `ChannelOutboundHandlerAdapter`
  - `ChannelDuplexHandlerAdapter`

#### 인코더/디코더
- 메세지를 전송/수신할 때는 데이터를 변환해야 한다. 인바운드 메세지를 바이트에서 다른 포맷(보통 객체)로 변환하는 `디코딩` 과정을 거친다. 아웃바운드 메세지를 반대로 현재 포맷에서 바이트로 `인코딩` 되는 과정을 거친다. 
- 두 가지 변환 과정이 필요한 이유는 네트워크 데이터는 연속된 바이트여야하기 때문이다.
- 네티가 제공하는 인코더/디코더 어댑터 클래스는 ChannelInboundHandler와 ChannelOutboundHandler를 구현한다.
  - 인바운드 데이터의 경우 인바운드 Channel에서 읽는 각 메세지에 대해 호출되는 channelRead 메세지/이벤트를 재정의한다. 이 메서드는 제공된 디코더의 decode() 메서드를 호출한 후 디코딩된 바이트를 파이프라인 다음 ChannelInboundHandler에 전달한다. 
  - 아웃바운드 메세지를 위한 패턴은 반대이며 인코더가 메세지를 바이트로 변환한 후 다음 ChannelOutboundHandler로 전달한다.
