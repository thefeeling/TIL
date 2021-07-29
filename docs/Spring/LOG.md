# Logging
사내에서 최근 ELK 도입을 준비하고 있는 과정에서 로깅 포맷을 지정하고 사용해야 하는 Needs가 생겨서 이번 작업을 시작하게 되었다. 스프링 부트에서는 로깅 설정을 프로파일별로 다르게 지정 할 수 있으며, 또한 로깅 구현체에 대한 유연한 변경(log4j2 등)이 가능하므로 작업 자체의 난이도가 높지는 않다고 할 수 있다.

## 다시 보는 로깅 레벨
![](http://myblog.opendocs.co.kr/wp-content/uploads/2015/03/log4j-1024x453.png)
- 출처: 구글 이미지 검색


## Hibernate Logging 관련 이슈
로깅 작업 중 Hibernate 관련 로깅이 slf4j에 제대로 적용이 안되는 이슈가 생겼었다. 이와 관련된 문서를 뒤져보다 [링크](https://medium.com/@scadge/how-to-enable-hibernate-logging-dc11545efd3d)를 통하여 해당 문제를 해결 할 수 있었다.

링크의 내용을 요약하자면, 하이버네이트 로깅 설정이 초기화 되는 구간에서 실제 slf4j에서 사용하는 로거 설정이 적용되며 자바 프로세스 실행 시 `-Dorg.jboss.logging.provider=slf4j` 혹은 코드에서 `System.setProperty("org.jboss.logging.provider", “slf4j")` 명시적으로 slf4j를 사용하도록 설정을 해줘야지 hibernate에서 발생하는 쿼리 로깅이 slf4j를 사용하여 실행되는 것을 확인할 수 있었다.


```java
    // LoggerProviders.class
    private static LoggerProvider findProvider() {
        final ClassLoader cl = LoggerProviders.class.getClassLoader();
        try {
            // Check the system property
            final String loggerProvider = AccessController.doPrivileged(new PrivilegedAction<String>() {
                public String run() {
                    return System.getProperty(LOGGING_PROVIDER_KEY);
                }
            });
            if (loggerProvider != null) {
                if ("jboss".equalsIgnoreCase(loggerProvider)) {
                    return tryJBossLogManager(cl, "system property");
                } else if ("jdk".equalsIgnoreCase(loggerProvider)) {
                    return tryJDK("system property");
                } else if ("log4j2".equalsIgnoreCase(loggerProvider)) {
                    return tryLog4j2(cl, "system property");
                } else if ("log4j".equalsIgnoreCase(loggerProvider)) {
                    return tryLog4j(cl, "system property");
                } else if ("slf4j".equalsIgnoreCase(loggerProvider)) {
                    return trySlf4j("system property");
                }
            }
        } catch (Throwable t) {
            // nope...
        }
        // ... 이하 생략
```


```java
public void logStatement(String statement, Formatter formatter) {
    if ( format ) {
        if ( logToStdout || LOG.isDebugEnabled() ) {
            statement = formatter.format( statement );
        }
    }
    LOG.debug( statement );
    if ( logToStdout ) {
        System.out.println( "Hibernate: " + statement );
    }
}
```


### 기타 참고 링크
- [Stackoverflow - Can't avoid hibernate logging SQL to console with Spring Boot and Logback](https://stackoverflow.com/questions/36496178/cant-avoid-hibernate-logging-sql-to-console-with-spring-boot-and-logback)
- [Hibernate Log 남기기](http://kwonnam.pe.kr/wiki/java/hibernate/log)

## 프로파일별 설정
- [Profile-specific Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-logging.html#_profile_specific_configuration)

스프링 부트에서는 프로파일별로 로깅 설정을 지정 할수 있도록 설정 할수 있다. 프로파일별로 달라지는 설정값은 `<springProperty>` 태그를 활용하여 분기 처리를 할 수 있다. 설정 값은 실행하는 프로파일의 `application.properties`의 값을 참조하게 된다.

## [Logstash-logback-encoder](https://github.com/logstash/logstash-logback-encoder#async-appenders)
로깅 포맷을 지정하는 과정에서, logback의 `JsonLayout`을 선 적용하여 설정을 했었는데, 어차피 ELK에서 사용하는 목적이 크기 때문에 포맷 자체를 ELK에서 Offical하게 사용하는 포맷을 사용하는 것이 더 나으리라 생각했다. 그래서 `Logstash-logback-encoder` 구현체를 사용하는 것으로 판단을 내렸고, 적용은 아래 내용을 참고하면 누구나 쉽게 할 수 있으리라 생각한다. 로컬 개발 환경에서는 굳이 해당 레이아웃을 적용할 필요가 없기 때문에, 스프링 부트에서 제공해주는 기본 로거 설정을 사용하도록 하였다.

로그는 `logstash-logback-encoder`에서 제공해주는 TcpAppender를 사용하여 Logstash에 바로 보낼 수 있도록 설정하였으며, TCP를 사용하기 때문에 연결에 대한 reconnection, KeepAlive 설정을 추가로 적용했다. 일단 적용 후 추후 로그에 대한 유실 유무를 판단하여 FileBeat를 사용하는 등 개선점에 대해서는 모니터링 후 판단하기로 결정을 내렸다.

로깅 프로퍼티의 경우, 현재 개발 환경에 Spring-Cloud-Sleuth를 사용하고 있어서 [해당 문서](https://cloud.spring.io/spring-cloud-sleuth/single/spring-cloud-sleuth.html#_json_logback_with_logstash)를 일정 부분 참고했다.

- build.gradle
```groovy
    /**
     * logstash-logback
     */
    compile('net.logstash.logback:logstash-logback-encoder:5.3')
```

- resources/logback-spring.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>

<configuration>

    <!-- FILE Appender -->
    <springProperty scope="context" name="LOG_DIR"        source="logging.path"      defaultValue="/var/log/tomcat8" />
    <springProperty scope="context" name="LOG_PATH_NAME"  source="logging.file-name" defaultValue="${LOG_DIR}/server-application.log" />
    <springProperty scope="context" name="LOG_STASH_ADDR" source="logging.log-stash" defaultValue="{IP_ADDRESS}" />
    <springProperty scope="context" name="APP_NAME"       source="spring.zipkin.service.name" defaultValue="DEFAULT_APP_NAME" />

    <appender name="file" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH_NAME}</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH_NAME}.%d{yyyyMMdd}</fileNamePattern>
            <maxHistory>60</maxHistory>
        </rollingPolicy>

        <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
            <providers>
                <timestamp>
                    <pattern>yyyy-MM-dd'T'HH:mm:ssZ</pattern>
                    <timeZone>UTC</timeZone>
                </timestamp>
                <version/>
                <logLevel/>
                <threadName/>
                <loggerName/>
                <message />
                <pattern>
                    <pattern>
                        {
                        "service": "${APP_NAME:-}",
                        "traceId": "%X{X-B3-TraceId:-}"
                        }
                    </pattern>
                </pattern>
            </providers>
        </encoder>
    </appender>

    <!-- Logstash Appender -->
    <appender name="stash" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
        <destination>${LOG_STASH_ADDR}</destination>
        <keepAliveDuration>5 minutes</keepAliveDuration>
        <reconnectionDelay>15 second</reconnectionDelay>

        <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
            <providers>
                <timestamp>
                    <pattern>yyyy-MM-dd'T'HH:mm:ssZ</pattern>
                    <timeZone>UTC</timeZone>
                </timestamp>
                <version/>
                <logLevel/>
                <threadName/>
                <loggerName/>
                <message />
                <pattern>
                    <pattern>
                        {
                        "service": "${APP_NAME:-}",
                        "traceId": "%X{X-B3-TraceId:-}"
                        }
                    </pattern>
                </pattern>

            </providers>
        </encoder>
    </appender>
    

    <appender name="async-file" class="ch.qos.logback.classic.AsyncAppender">
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>DEBUG</level>
        </filter>
        <!-- 
        발신자의 정보 (class명, 줄번호 등)가 추가되어 수집 서버로 전송여부를 결정합니다.
        true 설정 시, 성능 저하를 일으킬 수 있습니다.        
         -->
        <param name="includeCallerData" value="false"/>
        <!-- 
        - blocking queue의 최대 수용 갯수로 기본값은 256입니다.
        - 대기열 용량의 20 % 미만이 남아있을 때 AsyncAppender는 WARN 및 ERROR 이벤트 만 유지하면서 TRACE, DEBUG 및 INFO 수준의 이벤트를 삭제합니다
        -->        
        <param name="queueSize" value="2048"/>
        <!-- 
        false로 설정한 경우 큐가 가득찬 상황에서 appender는 메세지 유실을 방지하기 위해 application을 block 합니다. 
        true로 설정된 경우 application을 멈추지 않기 위해 메세지를 버립니다.
        -->                
        <param name="neverBlock" value="true"/>
        <!-- 
        LoggerContext가 정지하면 AsyncAppender의 stop 메소드는 작업 스레드가 timeout 될때까지 대기합니다.
        maxFlushTime를 사용하면, timeout 시간을 밀리초로 설정할 수 있습니다.
        해당 시간안에 처리하지 못한 이벤트는 삭제됩니다.
         -->
        <param name="maxFlushTime" value="60000"/>
        <appender-ref ref="file" />
    </appender>


    <appender name="async-stash" class="net.logstash.logback.appender.LoggingEventAsyncDisruptorAppender">
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>DEBUG</level>
        </filter>
        <waitStrategyType>sleeping</waitStrategyType>
        <appender-ref ref="stash" />
    </appender>

    <!-- Logger -->
    <logger name="org.hibernate.SQL" level="DEBUG" />
    <logger name="org.hibernate.tool.hbm2ddl" level="DEBUG"/>
    <logger name="org.hibernate.stat" level="DEBUG" />
    <logger name="org.hibernate.type.BasicTypeRegistry" level="DEBUG" />
    <logger name="org.hibernate.type.descriptor.sql" level="INFO" />


    <!-- Profile -->
    <springProfile name="default | dev">
        <include resource="org/springframework/boot/logging/logback/base.xml" />
    </springProfile>

    <springProfile name="stage">
        <root level="INFO">
            <appender-ref ref="async-stash"/>
            <appender-ref ref="async-file"/>
        </root>
    </springProfile>

    <springProfile name="live">
        <include resource="org/springframework/boot/logging/logback/base.xml" />
    </springProfile>

</configuration>
```

## 참고
- https://docs.toast.com/ko/Analytics/Log%20&%20Crash%20Search/ko/logback-sdk-guide/





