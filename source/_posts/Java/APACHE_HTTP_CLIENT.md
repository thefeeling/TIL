---
title: Apache Http Client
date: 2021/7/28 00:00:00
categories:
- Java
---

# Apache Http Client
#### The target server failed to respond 에러 관련 이슈
`ConnectionManager`에 의해 관리되는 `Persistent Connection`들은 KeepAlive한 상태를 유지할때 대상 서버는 HttpClient가 해당 이벤트에 반응할 수 없는 상태에서 그 끝에 있는 연결을 종료하고 연결이 유휴 상태가 되어 연결이 반쯤 닫히거나 'stale'이 됩니다. 해당 상태로 빠진 커넥션들은 정리가 필요하며, 이를 처리하기 위해서 HttpClient에서는 idleConnection과 expiredConnection에 대해 별도 스레드에서 정리할 수 있도록 설정할 수 있다. 또한 `ConnectionManager`를 별도로 지정하여 validate 타임을 지정할 수 있다.

```java
final PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
connectionManager.setMaxTotal(300);
connectionManager.setDefaultMaxPerRoute(300);
connectionManager.setValidateAfterInactivity(1000 * 5);

final CloseableHttpClient client = HttpClientBuilder.create()
        .setConnectionManager(connectionManager)
        .evictExpiredConnections()
        .evictIdleConnections(1000 * 30, TimeUnit.SECONDS)
        .build();
```
**참고 링크**
- https://www.baeldung.com/httpclient-connection-management
- https://thingsthis.tistory.com/186
- https://pchun.tistory.com/60
- http://hc.apache.org/httpcomponents-client-ga/tutorial/html/connmgmt.html#d5e659
- http://hc.apache.org/httpcomponents-client-ga/tutorial/html/connmgmt.html
- https://stackoverflow.com/questions/10558791/apache-httpclient-interim-error-nohttpresponseexception
- https://www.hyoyoung.net/103
- http://coryklein.com/tcp/2015/11/25/custom-configuration-of-tcp-socket-keep-alive-timeouts.html
- http://docs.likejazz.com/close-wait/#close_wait-%EC%9E%AC%ED%98%84
- https://12bme.tistory.com/538
- https://tech.kakao.com/2016/04/21/closewait-timewait/
- https://kwonnam.pe.kr/wiki/java/apache_http_client#stale_check
- https://stackoverflow.com/questions/29104643/httpclienterror-the-target-server-failed-to-respond