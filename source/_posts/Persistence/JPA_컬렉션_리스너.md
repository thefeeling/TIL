---
title: 'JPA 컬렉션 & 리스너'
date: 2021/7/28 00:00:00
categories:
- Persistence
---

# JPA 컬렉션 & 리스너

> 자바 ORM 표준 JPA 프로그래밍 14장 내용을 정리

## 컬렉션
- JPA에서는 Collection, List, Set, Map과 같은 컬렉션 구현체에 대한 매핑을 제공
  * Collection: 중복을 허용하고, 순서를 보장하지 않음
  * List: 중복을 허용하고, 순서를 보장
  * Set: 중복을 허용하지 않으나 순서를 보장하지 않음
  * Map: K,V 구조의 구현체
- @OneToMany, @ManyToMany와 같은 다수의 데이터를 매핑할 때 사용
- @ElementCollection을 사용한 다중의 값 타입 매핑
- 가장 많이 사용하는 JPA 구현체인 하이버네이트의 경우, 컬렉션 필드를 하이버네이트의 래퍼 클래스로 감싸서 관리함. 사용하는 래퍼 클래스는 아래 예제 코드를 참고하자
```java
// org.hibernate.collection.internal.PersistentBag
@OneToMany
Collection<Member> collection = new ArrayList<Member>();

// org.hibernate.collection.internal.PersistentBag
@OneToMany
List<Member> list = new ArrayList<Member>();

// org.hibernate.collection.internal.PersistentSet
@OneToMany
Set<Member> set = new HashSet<Member>();

// org.hibernate.collection.internal.PersistentList
@OneToMany
@OrderColumn
List<Member> orderColumnList = new ArrayList<Member>();
```

| Collection-Interface  | Hibernate-Collection  | 중복허용  | 순서 보관  |
|----------------------|---|---|---|
| Collection, List     | PersistenceBag   | O | X |
| Set                  | PersistenceSet   | X | X |
| List + @OrderColumn  | PersistenceList  | O | O |


> 래퍼 클래스를 통하여 원본 콜렉션을 감싸는 이유에 대해서 좀 더 상세하게 풀어보자면, 하이버네이트 매뉴얼에서는 이를 래퍼 타입을 통하여 지연로딩, 상태변경 그리고 캐싱에 대한 기능 지원을 위해서라고 한다. 
> 실제 PersistentBag과 같은 구현체 내부를 보면, 하이버네이트에서 기능지원을 위해 사용하는 AbstractPersistentCollection 클래스를 상속하고 있고 또한 List 인터페이스를 그대로 구현하고 있는 것을 확인할 수 있다. 그러므로, 매핑 시 반드시 자바 콜렉션 프레임워크의 표준 인터페이스를 사용하여 매핑을 해야 한다.

- Collection, List의 경우 중복을 허용하기 때문에, 지연로딩을 사용하는 경우라도 해당 콜렉션을 초기화하지 않는다. 반면, Set의 경우 중복에 대한 체크가 필요하기 때문에 지연로딩을 사용할 경우 해당 컬렉션을 초기화하는 작업을 거치게 된다.

```java
public class Board {
	...

	@OneToMany(mappedBy = "board")
	@OrderColumn(name = "POSITION")
	private List<Comment> comments = new ArrayList<Comment>();
}
```
- 위 코드와 같이 `List + @OrderColumn`을 조합하여 사용하는 경우, 순서를 판단할 수 있는 별도의 컬럼을 매핑하는 것이 가능하다. 해당 컬럼에 순서에 대한 시퀀스 벨류가 저장된다. 
- 하지만, 위 코드에서도 볼수 있듯이 실제 엔티티에 해당 컬럼이 매핑되는 것이 아닌 엔티티를 사용하는 측에 해당 컬럼을 명시하기 때문에 실 엔티티에서는 위와 같은 정보를 알수 없다. 또한, **실제 영속화하는 과정에서 별도의 update 구문이 한번 더 실행되며 콜렉션 내부의 삭제가 발생할 경우 순서를 조정하기 위한 연속적인 update 구문이 실행된다. 성능상에도 그리 좋은편은 아니라고 할 수 있다.**

```java
public class Board {
	...

	@OneToMany(mappedBy = "board")
	@OrderBy("username desc, id asc")
	private List<Comment> comments = new ArrayList<Comment>();
}
```
- 별도의 순서를 저장하는 컬럼을 사용하는 것보다 `@OrderBy`를 사용하여 실제 사용하는 컬럼에서 순서를 지정하는 방법이 `@OrderColumn`을 사용하는 것보다 나을 수 있다.

## 컨버터
- 엔티티의 데이터를 영속화 할때, 데이터의 변환이 필요한 경우 컨버터 관련 구현을 해두면 데이터베이스와 JPA 사이에서의 변환 작업을 편리하게 진행할 수 있다. 아래 예제 코드를 살펴보자
```kotlin
@Entity
@Table(name = "boards")
@Convert(converter = TagConverter::class, attributeName = "tags")
class Board protected constructor(){
	...
	@Convert(converter = SecretConverter::class)
	var secret: Boolean = false
		protected set

	@Column(name = "tags", columnDefinition = "text", nullable = false)
	var tags: MutableList<String> = mutableListOf()
	...
}
```

- 컨버터는 `AttributeConverter` 인터페이스를 구현해야하며, 프로퍼티/멤버 레벨 및 클래스 레벨에서 지정이 가능하다. 클래스 레벨에서 지정하는 경우 `attributeName`에 변환이 필요한 프로퍼티/멤버를 명시하면 된다.
- 전역으로 설정하고 싶은 경우 `autoApply`의 값을 `true`로 지정하면 제네릭에 명시되어 있는 타입에서의 변환에 대하여 전역 레벨에서 변환 작업을 하게 된다. 

```kotlin
@Converter(autoApply = false)
class SecretConverter : AttributeConverter<Boolean, String>{
	// 
	override fun convertToDatabaseColumn(attribute: Boolean): String {
		return if (attribute) "Y" else "N"
	}

	override fun convertToEntityAttribute(dbData: String): Boolean {
		return dbData == "Y"
	}
}
```
- [링크](https://docs.oracle.com/javaee/7/api/javax/persistence/Convert.html)를 참고하면 좀 더 세부적인 컨버터 구현에 대한 내용 확인이 가능하다.

## 리스너
![JPA_엔티티_리스너_시점](https://i.imgur.com/kdrVtQ8.png)
- 엔티티의 생명주기에 따른 이벤트를 처리할 수 있으며, 생명주기에 따른 특징은 아래를 참고하자
  1. `PostLoad`
     - 영속성 컨텍스트 조회 직후 호출
     - 2차 캐시에 저장되어 있어도 호출됨
  2. `PrePersist`
     - persist() 호출 전 시점에 호출
     - 식별자 생성 전략을 사용했을 경우 아직 식별자는 존재 하지 않음
  3. `PreUpdate`
     - `flush`, `commit` 호출하여 엔티티를 수정하기 직전에 호출
  4. `PreRemove`
     - `remove`를 호출하여 엔티티를 영속성 컨텍스트에서 삭제하기 전에 호출
     - 영속성 전이가 일어나도 호출되며 orphanRemoval에 대하여 `flush`, `commit` 시에 호출됨
  5. `PostPersist`
     - `flush`, `commit` 호출하여 엔티티를 DB에 저장한 후 호출
     - 데이터베이스 저장 후 호출되기 때문에, 식별자가 존재
  6. `PostUpdate`
     - `flush`, `commit` 호출하여 엔티티를 수정하여 DB에 반영한 이후에 호출
  7. `PostRemove`
     - `remove`를 호출하여 엔티티를 DB에서 삭제한 이후에 호출
- 리스너 등록은 `엔티티에 직접 적용`, `별도 리스너 등록`이 있다.
  - 엔티티에 직접 적용
	```kotlin
	class Board {
		...
		@PrePersist
		fun prePersist() {
			logger.info("PrePersist(), {}", this)
		}

		@PostPersist
		fun postPersist() {
			logger.info("postPersist(), {}", this)
		}
	}
	```
  - 별도 리스너 클래스 사용
	```kotlin

	@Entity
	@Table(name = "boards")
	@EntityListeners(value = [BoardListener::class])
	class Board {
		...
	}

	class BoardListener {
		val logger = LoggerFactory.getLogger(this::class.java)

		@PostLoad
		fun postLoad(obj: Any) {
			logger.info("postLoad()")
		}

		@PrePersist
		fun prePersist(obj: Any) {
			logger.info("PrePersist()")
		}

		@PostPersist
		fun postPersist(obj: Any) {
			logger.info("postPersist()")
		}
	}
	```
- 리스너와 비슷하게 사용할 수 있는 `Audit` 기능도 존재한다.
- 리스너가 중첩된 구조로 등록되어 있는 경우, 아래와 같은 순서대로 리스너가 실행된다.
  1. 기본 리스너
  2. 부모 클래스 리스너(@MappedSuperClass 등으로 매핑한 슈퍼 클래스)
  3. 별도 리스너
  4. 엔티티
- 슈퍼 클래스 엔티티에서 지정한 리스너와 기본 리스너를 무시하고 싶다면 아래와 같이 설정하는 것이 가능하다.
```kotlin
@Entity
@Table(name = "boards")
@EntityListeners(value = [BoardListener::class])
@ExcludeDefaultListeners
@ExcludeSuperclassListeners
class Board protected constructor(){
}
```