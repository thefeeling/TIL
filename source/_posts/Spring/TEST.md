---
title: 'Spring Test'
date: 2019/7/12 00:00:00
categories:
- Spring
---

# Spring Test
---------

1. Spring Boot 테스트 기능 소개
    - [Spring Boot Test by ToastMeetup](http://meetup.toast.com/posts/124)

2. Spring Boot 테스트 관련 Use-Case
    - [test-driven-spring-boot](https://github.com/xpinjection/test-driven-spring-boot/tree/master/src/test)

3. Spring Boot EmbeddedDatabase 설정 시 빈 등록 샘플 코드
    - API Reference : https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/jdbc/datasource/embedded/EmbeddedDatabaseBuilder.html
    ```java
    private DataSource dataSource() {
        EmbeddedDatabaseBuilder builder = new EmbeddedDatabaseBuilder();
        EmbeddedDatabase db = builder
            .setType(EmbeddedDatabaseType.H2)
            .setName("testdb;DATABASE_TO_UPPER=false;MODE=Oracle")
            .addScript("schema.sql")
            .addScript("data.sql")
            .build();
        return db;
    }
    ```


4. `@DataJpaTest`을 사용한 DataJpa 테스트 예제 코드
    - [@DataJPATest with Spring Boot](http://javasampleapproach.com/testing/datajpatest-with-spring-boot)
5. `JpaVendorAdapter` 인터페이스를 구현 객체를 @Bean으로 동록하여 EntityManagerFactoryBean 등록 예제 코드
    - 테스트 내장 디비 설정 시 사용.
    - 링크 : https://stackoverflow.com/questions/21968965/disable-table-recreation-in-spring-boot-application
    ```java
    @ComponentScan
    @EnableAutoConfiguration
    @EnableHypermediaSupport
    @EnableSpringDataWebSupport
    public class ApplicationConfig {

        @Bean
        public DataSource dataSource() {
            DriverManagerDataSource datasource = new DriverManagerDataSource();
            datasource.setDriverClassName("org.postgresql.Driver");
            datasource.setUrl("jdbc:postgresql://localhost/mydatabase");
            datasource.setUsername("myusername");
            datasource.setPassword("mypassword");
            return datasource;
        }

        @Bean
        public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource, JpaVendorAdapter jpaVendorAdapter) {
            LocalContainerEntityManagerFactoryBean lef = new LocalContainerEntityManagerFactoryBean();
            lef.setDataSource(dataSource);
            lef.setJpaVendorAdapter(jpaVendorAdapter);
            lef.setPackagesToScan("my.domain.package");
            Properties jpaProperties = new Properties();
            jpaProperties.setProperty("hibernate.hbm2ddl.auto", "update");
            lef.setJpaProperties(jpaProperties);
            return lef;
        }

        @Bean
        public JpaVendorAdapter jpaVendorAdapter() {
            HibernateJpaVendorAdapter hibernateJpaVendorAdapter = new HibernateJpaVendorAdapter();
            hibernateJpaVendorAdapter.setShowSql(false);
            hibernateJpaVendorAdapter.setGenerateDdl(true);
            hibernateJpaVendorAdapter.setDatabase(Database.POSTGRESQL);
            return hibernateJpaVendorAdapter;
        }

        @Bean
        public PlatformTransactionManager transactionManager() {
            return new JpaTransactionManager();
        }

        public static void main(String[] args) {
            SpringApplication.run(ApplicationConfig.class, args);
        }
    }
    ```