# MVC와 WebFlux에서의 @ReqeustParam

## Spring MVC
- Spring MVC에서는 기본적으로 `querystring`, `form-data`, `multipart` 요청에 대해 `@ReqeustParam`으로 매핑이 가능하다.
- 이는 서블릿 API에서 `querystring`, `form-data(requestBody)`를 parameters map에 같이 바인딩하기 때문이다. 

> [RequestParamMethodArgumentResolver.resolveName](https://github.com/spring-projects/spring-framework/blob/f0f450a18dec7639ce8b967ed26c78cf777d4f7e/spring-web/src/main/java/org/springframework/web/method/annotation/RequestParamMethodArgumentResolver.java#L162)을 살펴보면 간단하게 로직 확인이 가능하다.

## Spring Webflux
- 웹플럭스에서는 querystring에서 대해서만 바인딩을 지원한다.

> [RequestParamMethodArgumentResolver.resolveNamedValue](https://github.com/spring-projects/spring-framework/blob/f0f450a18dec7639ce8b967ed26c78cf777d4f7e/spring-webflux/src/main/java/org/springframework/web/reactive/result/method/annotation/RequestParamMethodArgumentResolver.java#L101)을 살펴보면 간단하게 로직 확인이 가능하다.

- MVC에서처럼 querystring, form-data, multipart 모두 값을 받으려면 `@ModelAttribute`를 이용해야 한다.

## 참고
- [RequestParam (Spring Framework 5.3.7 API)](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestParam.html)