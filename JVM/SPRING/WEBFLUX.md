


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
    public Mono<String> res() {
        return webClient.get()
                .uri("https://jsonplaceholder.typicode.com/guide.html")
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .flatMap(clientResponse -> clientResponse.bodyToMono(String.class));
    }


}
```