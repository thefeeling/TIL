---
title: 'RestTemplate'
date: 2019/7/12 00:00:00
categories:
- Spring
---

## ClientHttpRequestInterceptor 구현 관련
ClientHttpRequestInterceptor를 구현하여 request 와 response를 핸들하는 경우.
request를 조회하는것은 문제가 없지만 response의 경우 인터셉터의 프로세스를 수행 후 인풋스트림이 닫히기 때문에 getBody() 에서 얻어올 컨텐츠 타입이 null포인터 익셉션이 발생한다.

RestTemplate에 생성자로 BufferingClientHttpRequestFactory타입의 클래스를 넘겨주어야만 위와 같은 현상을 피할 수 있다. BufferingClientHttpRequestFactory 는  HttpComponentsClientHttpRequestFactory 를 주입받는다


## Link
[Reqeust, Reponse Logging](http://lng1982.tistory.com/238)
