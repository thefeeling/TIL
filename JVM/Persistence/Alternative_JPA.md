
같이 근무했던 시니어 개발자분께서 내용이 좋다면서 추천해주셔서 [링크](https://www.youtube.com/watch?v=2zQdmC0vnFU)를 통하여 동영상을 시청했다. 분량은 대충 1시간 가량 되는데, JPA를 사용하면서도 하이버네이트에 대한 충분한 학습을 하지 못해서 겪었던 지난 1년간의 많은 시행착오들이 생각이 났고, Kotlin을 메인으로 사용했을때의 다양한 선택지에 대해서 고민을 해볼 수 있었던거 같아서 매우 유익했다고 할 수 있다. 

# Alternatives to JPA
- 데이터를 표현하는 관점에 따라 달라 질 수 있다. 
  - Relational
  - OOP
- 두 가지 관점 중 어디를 중점으로 설계 하느냐에 따라 방향이 크게 달라질 수 있다.
- 데이터 중심(data-centric)의 경우, OOP적인 설계가 크게 맞지 않을 수 있고, 요즘 ORM을 사용하는 것이 유행인것 마냥 흘러가고 있어서 이에 대한 진지한 고민이 필요해보인다.
- Hibernate가 커버하는 SQL은 약 95프로에 가까운데, 나머지 5프로에 대해서는 커버를 못하기 때문에 실제로 하이엔드 성능을 요구하는 상황에서는 ORM이 맞지 않다고 볼 수 있다.

## JPA의 장단점?
### 장점
- 비즈니스 레이어에 대해 DB 중심적인 사고가 아닌 어플리케이션 레이어에서 이를 처리해본 사람들은 NoSQL을 사용했을 때의 접근이 수월했다.
- 디비 벤더 종속적으로 개발을 하지 않아도 된다.
- SQL문장에 대해 크게 학습을 하지 않아도 된다.
  - 문장으로 쓰느냐 vs 코드(API)로 이를 표현하느냐?
  - API로 사용하는 것이 Type-safe한 전개가 가능하기 때문에 안정적이다.
- Stateful, Statless에 대한 지원
### 단점
- SQL에 친숙한 사람들의 경우, JPQL에 대한 반감 혹은 적응이 힘들 수 있다. 두 가지 접근 방법에 대해 상이한 부분이 존재하며 결국 둘다 배워야 하는 점이 생긴다.
- Hibernate에 대한 러닝커브가 상당히 높다.
- Bulk Operation의 성능이 좋지 않다.
- JPA Vendor에서 제공해주는 기능에 대해서 학습 비용이 발생한다.
  - HQL, @DynamicInsert, @LazyCollection
  - 2nd Cache(recommend JCache(JSR-305))

## 그래서 쿠팡은 어떻게?
- 성능보다는 생산성을 위주로 사용했으며, 오픈 후 성능이 나오질 않아서 JPA에 대한 학습도 진행하고 튜닝하는 등의 작업을 진행했었다.
- Not Deep Dive
  - Missing Override(hashCode, equals and toString)
  - No Using @NatualId: 비즈니스적인 필요에 의해 @NatualId가 필요한 경우가 있다.
- Best Practice가 존재하질 않아 제대로 사용하지 못한 케이스가 많았다.
- 퍼포먼스가 나오질 않다보니 비용 측면에서도 충분히 줄일 수 있는 부분이 많은데, 제대로 학습을 하지 못해서 생긴 이슈 아닌 이슈가 많았다고 한다.


## 그래서 JPA에 대안이 될 수 있는 솔루션들은?
- 단점은 버리고 장점을 취할 수 있는 다른 대안들은 뭐가 있을까?
- Design Principle
  - OOP 기반의 Multi-DB Vendor
  - No Need stateful for Reference Object
  - Support association, inheritance, converter in JPA
- Performance
  - Speed up to Plain SQL
  - Stateless
  - Support Asynchronous or Reactive
  - Support Bulk or Batch Operation

### Slick
- Database Access Library
- ORM => Functional Relational Mapping
- Relational Model to Scala OOP
- Natural fit
- Stateless
- Matures(Slick version 3)(Non-Blocking DBIO)

### jOOQ
가장 도입하기 쉽고 러닝커브가 낮음
- SQL과 유사하게 API를 사용할 수 있으며, Type-Safe한 성격은 그래도 가져갈 수 있다.
- DB-First, DB Schema로부터 자바의 엔티티 클래스를 만들어야 하는 단점이 존재한다.
- Stateless
- Need DBMS Owner Authority


### Requery
- No Refelection - apt code generation
- Fast Startup & Performance
- Schema Generation
- Non-Blocking
- upsert
- compile time entity validation
- Support alomost JPA Annotations

### Exposed - Kotlin SQL Framework
- Lightweight SQL Framework
- Two Layers of data access
  - Typesafe SQL wrapping DSL
  - Lightweight Data Access Object
- Not Mature...

### 그래서 적합한 대안은?
- 기존 레거시 데이터베이스가 존재하는 경우? 자바만 하는 경우?
  - jOOQ, requery
- Scala만 사용하는 경우?
  - Slick
- Kotlin Only?
  - requery, Exposed
- 언어와 상관 없다면?
  - requery
- Reactive Programming?
  - requery with kotlinx-requery
  - kotlinx-rxjava2-jdbc

## Requery Overview
- 안드로이드에서만 쓰이는 것이 아니다.
- 충분히 서버 어플리케이션에서도 사용이 가능하다.
- 하이버네이트의 Proxy 개념이 없다. 즉, Lazy Initialize라는 개념 자체가 없다. Mybatis랑 비슷한 개념으로 생각해도 좋다. 속도가 생각보다 빠르다.
- 부가적으로 라이브러리는 필요없다. 
- Upsert 기능이 굉장히 매력적이다.
- Compile Time Entity/Query Validation
- Entity is stateless
- Thread에 제한을 받지 않음(vs JPA EntityManager)
- Support RxJava, Async Operations on Java8

### Why Requery?
- Provide Benefit of ORM
  - Entity Mapping
  - Schema Generation
  - Compile Time Error Detecting

Bulk Operation은 JPA에 비해서 거의 100배 가량 빠르다고 한다. REST API 호출에서 퍼포먼스 Checking을 했을 때는 약 10배 가량 JPA를 사용했을때보다 빠르다고 한다. Upsert 기능이 제공되고 레이지한 로드(프록시를 사용한 접근이 아닌 특정 컬럼만 일부 Fetch하고 추후에 필요한 데이터를 가져오는 방식)도 가능하다.

### Define Entity - Java, Kotlin
JPA와 Hibernate보다는 간결한 기능을 제공하고 있다. 간결한 기능을 제공한다는 것은 JPA와 Hibernate보다는 기능적인 가지 수가 좀 적을 수 있다는 이야기이다. 

### EntityDataStore
- FindByKey
- select/insert/update/upsert/delete
- where/eq,lte,lt,gt,gte,like,in,not
- groupBy / having / limit / offset
- support SQL Functions
  - count, sum, avg, upper, lower ...
- raw query

### CoroutineEntityDataStore
- 코틀린에서는 코루틴을 통하여 비동기 프로그래밍이 가능하다. JDBC가 블록킹 구간이 존재하지만 엔티티를 ResultSet으로부터 인스턴싱하는 과정을 비동기로하면 CPU를 좀 더 효율적으로 사용할 수 있다.
- requery는 자바의 CompletableFuture를 사용

### spring-data-requery
  - 운영 시스템은 아니더라도 개인 프로젝트에 적용해본다면 별 문제 없겠지만, 운영시스템에 이걸 적용한다면 ..... 상황을 겪을 수 있다. 그래서 만든 것이 spring-data-requery 프로젝트라고 한다.
  - RequeryOperations
  - RequeryTransactionManager for TransactionManager
    - Support Spring @Transactional
  - Better performance than spring-data-jpa
    - exists, paging할때, 매번 연관된 엔티티를 모두 조회하지 않는다.
  - Repository build in SQL
  - ByPropertyName Auto Generation Methods
  - @Query, Native SQL Query
  - Query By Example
  - Not Support
    - 조인에 대해서는 개발자가 명시를 해줘야 한다. Annotation Path에 대한 자동으로 Query를 만들어 주지는 않는다.
    - Named Parameter의 경우 현재 지원하지 않지만, 추후 지원이 가능 할거라고 한다.
### Query By Example
  - 검색 조건에 대한 Predicate를 작성하는 거랑 비슷함
### Query By Property
  - JPA의 가장 강력한 부분인데, 이에 대한 지원은 하고 있는데, Association에 대한 지원은 위에서 말한대로 현재 없다고 한다.
  - JPA의 findXXX 매소드 시그니처를 사용 하듯이 사용하면 된다.

### Exists
  - 현재 JPA에서는 ExistExecution에서 모든 조회 결과를 가져오고 이에대한 존재 유무를 체크하게 된다고 한다.
  - spring-data-requery에서는 ExistExecution 처리 시, 조회 결과를 단건만 가져와서 조회 조건에 대한 존재 유무를 체크한다고 한다.


### Delete in JPA
- 연관 관계가 어떻게 되는지 모두 파악 후 Delete에 대한 실행이 진행된다.
- 연관 관계에 대한 모든 파악을 진행 후 진행해야 하기 때문에 결국 `Read` 작업이 선행될 수 밖에 없다.
- Bulk Operation의 경우, 성능상 손실이 많이 발생한다.
- Bulk Operation의 원래 의도는 Set 방식으로 바로 지우는 것을 원하게 되는데, 이렇게 Read 액션이 먼저 발생하게 되면 성능적으로 느려질 수 밖에 없는 상황이다. Set 방식으로 움직여야 하는 것은 Direct로 SQL 구문을 사용하여 처리 할 수 있도록 가이드를 해주는 것이 중요하다. 깊게 이해하여 사용하는 것이 너무 중요하다.
- 작게는 3배 많게는 100배 가량 퍼포먼스 차이가 발생할 수 있다고 한다.

### Future Works
- Named Parameter
- `@Param` in Spring Data
- Complicated Aggregation Operations
- Requery for Apache Phoenix(Hbase)
- CoroutineEntityStore 


## QnA
- MySQL에서 넘어가는 이유가 뭔가요?
  - Money!!
  - AWS RDS Aurora가 비용이 너무 비쌈...ㅠㅠ
  - 벤치마크 했을 때, 포스트그래가 생각보다 성능이 좋았다.
  - JPA를 쓴 것이 성능이 느려서 고생을 했었는데, DB 벤더를 바꿈으로서 얻게 되는 이점이 생각보다 많이 있을 거라고 생각하여 변경을 하게 됐다.