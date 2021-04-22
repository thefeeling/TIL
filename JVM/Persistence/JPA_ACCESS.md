# JPA @Access
```java
@Target( { TYPE, METHOD, FIELD })
@Retention(RUNTIME)
public @interface Access {
    AccessType value();
}
```
- @Access 어노테이션은 엔터티 클래스, 매핑된 수퍼 클래스 또는 포함 가능한 클래스 또는 엔터티 맴버의 액세스 방법을 지정하는 데 사용.
- Method, Class, Field에 매핑 가능
- `AccessType`
  - Field: 리플렉션 기반으로 필드/멤버에 액세스
  - Property: Getter/Setter 기반으로 필드/멤버에 액세스
- 기본적으로 `AccessType`은 `@Id`을 넣은 위치로 정의. 
  - 필드/멤버에 넣으면 `AccessType.FIELD`
  - `getter`에 넣으면 `AccessType.PROPERTY`