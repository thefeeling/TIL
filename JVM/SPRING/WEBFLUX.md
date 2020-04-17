
## Blocking Call Handling
```java
Mono blockingWrapper = Mono.fromCallable(() -> { 
    return /* make a remote synchronous call */ 
});
blockingWrapper = blockingWrapper.subscribeOn(Schedulers.boundedElastic()); 
```
JDBC를 사용하는 경우, JDBC에 대한 구현 자체가 Blocking-Call로 발생하기 때문에, 그대로 사용할 경우 리액터 스레드가 빠르게 반환되지 않고 전반적인 어플리케이션 성능에 영향을 줄 수 있다. 이런 경우 때문에, 위 코드와 같이 스케줄러를 지정하여 사용하는 것이 리액터 레퍼런스에서 소개하는 적절한 방법이다. 아래 링크는 JDBC를 사용한 Blocking Call에 대한 이해를 좀 더 깊게 해줄 수 있는 좋은 글이다.

- [리액티브하게 리팩토링하기 - JDBC 마이그레이션 해부](http://blog.lespinside.com/refactoring-to-react/)
- [Spring 5 WebFlux and JDBC: To Block or Not to Block](https://dzone.com/articles/spring-5-webflux-and-jdbc-to-block-or-not-to-block)


## WebClient
### Logging
Filter를 사용하는 방법도 존재하지만, 필터에서는 Http Request와 Response의 디테일한 모든 부분을 보기 힘들다. Netty에 LoggingHandler를 활용하여 로깅을 설정할 수 있으며, 아래와 같이 설정하게 되면 오고가는 HTTP의 요청과 응답의 헤더와 바디를 로깅할 수 있다.


```bash
logging.level.reactor.netty.http.client.HttpClient=DEBUG
```


```java
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelPromise;
import io.netty.handler.logging.LoggingHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.channel.BootstrapHandlers;
import reactor.netty.http.client.HttpClient;

import java.net.SocketAddress;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api")
public class ApiController {
    private static final HttpClient httpClient = HttpClient.create()
            .tcpConfiguration(tcpClient ->
                    tcpClient.bootstrap(bootstrap ->
                            BootstrapHandlers.updateLogSupport(bootstrap, new HttpLoggingHandler(HttpClient.class))));

    private static final WebClient webClient = WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .build();

    @RequiredArgsConstructor
    private static class Body {
        private final String foo;
    }

    private static class HttpLoggingHandler extends LoggingHandler {
	  // 주의) LoggingHandler의 기본 생성자를 사용하게 될 경우, 로깅에 대한 디폴트 레벨이 지정된다. 
        public HttpLoggingHandler(Class<?> clazz) {
            super(clazz);
        }

        @Override
        protected String format(ChannelHandlerContext ctx, String event, Object arg) {
            if (arg instanceof ByteBuf) {
                ByteBuf msg = (ByteBuf) arg;
                return msg.toString(StandardCharsets.UTF_8);
            }
            return super.format(ctx, event, arg);
        }

        @Override
        public void channelRegistered(ChannelHandlerContext ctx) {
            ctx.fireChannelRegistered();
        }

        @Override
        public void channelReadComplete(ChannelHandlerContext ctx) {
            ctx.fireChannelReadComplete();
        }

        @Override
        public void channelActive(ChannelHandlerContext ctx) {
            ctx.fireChannelActive();
        }

        @Override
        public void flush(ChannelHandlerContext ctx) {
            ctx.flush();
        }

        @Override
        public void connect(ChannelHandlerContext ctx, SocketAddress remoteAddress, SocketAddress localAddress, ChannelPromise promise) {
            ctx.connect(remoteAddress, localAddress, promise);
        }

        @Override
        public void userEventTriggered(ChannelHandlerContext ctx, Object evt) {
            ctx.fireUserEventTriggered(evt);
        }
    }

    @GetMapping
    public Mono<Map> res() {
        return webClient.post()
                .uri("https://postman-echo.com/post")
                .syncBody("{\"foo\" : \"bar\"}")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .flatMap(clientResponse -> clientResponse.bodyToMono(Map.class));
    }


}
```

![웹클라이언트_로깅이미지](https://i.imgur.com/OLFG7Uk.png)