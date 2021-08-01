---
title: 'Spring & JPA EntityManager & 동시성'
date: 2021/7/28 00:00:00
categories:
- Persistence
---

# Spring & JPA EntityManager & 동시성
JPA에서 영속성 컨텍스트에 접근하는 방법은 EntityManagerFactory를 통하여 만들어진 EntityManager를 통한 접근 방법이다. JPA 서적에서는 EntityManager는 Thread-Safe함을 보장하지 않기 때문에 공유 상태를 만들어서 사용하면 안된다고 적혀저 있는데, [하이버네이트 문서](https://docs.jboss.org/hibernate/core/4.0/hem/en-US/html/transactions.html)을 보면 몇가지 동시성과 관련된 주의점에 대해 책에서의 이야기처럼 `Application-Level EntityManager`, `User-Session-Level EntityManager`의 사용을 안티패턴이라고 규정하고 있다. 

의문이 들었던 부분은 Spring과 같은 컨테이너를 사용할 때, EntityManager를 주입 받아 사용하는 경우에 이에 대한 Thread-Safe를 어떻게 보장하는지가 궁금한 지점이었다.

EntityManager는 `Container-managed EntityManager`이고 나머지는 코드에서 직접 핸들링하는 `Application-managed EntityManager`