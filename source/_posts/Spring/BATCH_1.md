---
title: '스프링 부트 배치 #1 - 개요/주요개념'
date: 2019.1.1. 00:27
categories:
- Spring
---

# 스프링 부트 배치 #1 - 개요/주요개념
## 개요
* 백엔드의 배치 처리 기능을 구현하는 데 사용하는 프레임워크.
* 부트 배치의 경우, 스프링 배치의 설정 요소들을 간편화시켜 스프링 배치를 빠르고 쉽게 사용할 수 있도록 구성.
  * 배치란, 순차적으로 자료를 처리한다는 뜻으로 일괄 처리와 같은 뜻

## Why Spring Batch?
* 대용량 처리 최적화되어 있고, 고성능을 발휘
* 로깅. 통계 처리, 트랜잭션 관리 등 필수 기능 지원
* 예외 및 비정상 동작에 대한 방어 기능
* 개발자는 Spring Batch 프로그래밍 모델을 사용하여 비즈니스 로직에 집중하고 프레임워크가 인프라를 관리하도록 함.

## 주의사항
* 복잡한 구조와 로직을 피해야 함
* 데이터를 직접 다루는 코드가 많으므로, 무결성을 유지할 수 있는 방어적인 방법을 사용해야 함.
* I/O 사용을 최소화 해야 한다. 잦은 I/O 발생은 배치 어플리케이션 성능에 영향을 줄 수 있기 때문이다.
  * Minimize system resource use, especially I/O. Perform as many operations as possible in internal memory.
* 스프링 부트 배치는 별도의 스캐줄링 기능을 제공하지 않는다. 이에 따라, 별도의 스케줄링 구현체를 사용해야 한다.
  * 쿼츠, 스프링 스캐줄러 등을 사용해야 함.
* 실제 환경과 비슷한 데이터 볼륨을 가지고 테스트를 함으로써, 처리 안정성을 높히는 것이 좋다.

## 배치 처리 절차
* 읽기: 데이터베이스, 파일 등에서 데이터를 읽는다. 
  * Reads a large number of records from a database, file, or queue.
* 처리: 읽은 데이터를 처리/가공
  * Processes the data in some fashion.
* 쓰기: 처리/가공한 데이터를 별도의 저장소에 저장
  * Writes back data in a modified form.

![](https://docs.spring.io/spring-batch/4.1.x/reference/html/images/spring-batch-reference-model.png)

* Job과 Step은 1:N의 관계로, 하나의 Job에 여러 개의 Step으로 처리하는 프로세스를 가진다. 각각 Step은 ItemReader, ItemProcessor, ItemWriter를 가지고 있으며, Step과는 1:1 관계를 가진다.

### 1. Job
* 처리 과정 하나를 가리키는 객체로 여러 개의 Step을 포함할 수 있다. Step들의 컨테이너 역할을 수행한다.
* Job 객체를 만드는 빌더 클래스는 여러 개 있으며, 여러 빌더를 통합한 JobBuilderFactory를 통하여 원하는 Job을 쉽게 생성할 수 있음.
```java
@Bean
public Job footballJob() {
	return this.jobBuilderFactory.get("footballJob")
				.start(playerLoad())
				.next(gameLoad())
				.next(playerSummarization())
				.end()
				.build();
}
```
* JobBuilderFactory.get()을 호출하게 되면, 새로운 JobBuilder 인스턴스를 반환함. JobBuilder를 생성하는 과정에서 JobRepository를 주입받게 되는데, JobBuilderFactory에서 생성되는 모든 JobBuilder가 동일한 JobRepository를 사용하게 된다.
* **JobBuilerFactory에서 JobBuilder를 생성하며 생성한 빌더를 통하여 Job을 생성할 수 있다.**
* **JobBuilder는 직접 Job을 생성하는 것이 아니라, 별도의 구체적인 JobBuilder를 통하여 Job을 생성하게 된다.** Job을 생성할 수 있는 여러 상황을 고려하여 이렇게 구현되어 있는듯 보이며, 매소드 체이닝을 통하여 원하는 내용을 명시하면 쉽게 처리 할 수 있다.

```java
@Autowired
private JobBuilderFactory jobBuilderFactory;

@Bean
public Job simpleJob() {
		// 1. simpleJob 이라는 이름을 가진 Job을 생성할 수 있는 JobBuilder 인스턴스 반환
	return jobBuilderFactory.get("simpleJob")
		// 2. Step을 주입, Step혹은 Flow를 파라메터로 받아서 구체적인 빌더를 생성할 수 있다.
		.start(simpleStep())
		// 3. build()를 호출하여 "simpleJob"의 이름을 가지는 Job을 생성
		.build();
}
```

#### 1.1 JobInstance
* 하나의 Job의 실행 단위, JobExecution을 여러개 가질 수 있음

#### 1.2 JobExecution
* JobInstance에 대한 한 번 실행을 나타내는 객체. Job 실행에 대한 정보를 담고 있는 도메인 객체로 JobInstance, 실행 상태, 시작 시간, 종료 시간, 실패 메세지 등 정보를 담고 있음.

#### 1.3 JobParameter
![](https://docs.spring.io/spring-batch/4.1.x/reference/html/images/job-stereotypes-parameters.png)
* Job이 실행될 떄 필요한 인자를 Map 타입으로 저장하는 객체. JobInstance와 1:1 관계이며, 사용 할 수 있는 데이터 타입은 Long, String, Date, Double 등이 있다.
* JobInstance를 구분하는 기준으로 사용될 수 있다.
  * `JobInstance = Job + identifying JobParameters`



### 2. Step
* 실질적인 Job 처리를 담당. 필요한 정보를 담고 있는 도메인 객체이며 모든 Job은 여러 개의 Step을 가질 수 있다.
#### 2.1 StepExecution
* Job에 JobExecution이 있듯이, Step에도 이에 대응하는 StepExecution이 존재한다. 해당 Step의 실행 정보를 담고 있다.

### 3. JobRepository
* JobRepository는 배치 처리 정보를 담고 있는 객체로, Job의 실행 횟수 및 시간 정보 등의 메타 정보를 가지고 있다. Step의 실행정보를 담고 있는 StepExecution도 가지고 있으며, 전체 메타 데이터를 가지고 있는 객체라고 생각하면 된다.

### 4. JobLauncher
* Job, JobParameter와 함께 배치를 시작하는 인터페이스로 사용. 인터페이스의 매소드는 `run()`만 존재함.

### 5. ItemReader
* Step에서 데이터를 읽어오는 역할을 수행. FILE, DB, QUEUE 등에서 데이터를 읽어 올 수 있다.

### 6. ItemProcessor
* 읽어온 데이터를 처리하는 인터페이스. Input과 Output에 대한 타입 명시가 가능

### 7. ItemWriter
* 이전 단계에서 처리한 데이터를 저장하는 인터페이스. List 인터페이스를 통하여 지정한 타입의 데이터를 받아오며 CHUNK 단위로 데이터를 받아온다.

## 참고자료
* [처음 배우는 스프링 부트 2](https://book.naver.com/bookdb/book_detail.nhn?bid=14031681)
* [Spring Batch - Reference Documentation](https://docs.spring.io/spring-batch/4.1.x/reference/html/index.html)

