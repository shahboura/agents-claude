---
name: java-spring
description: Java Spring Boot conventions with dependency injection, validation, and testing.
---

- Build with `./mvnw verify` or `./gradlew build`; enforce Checkstyle + SpotBugs in CI.
- Run tests with JUnit 5 + AssertJ; mock with Mockito; use `@SpringBootTest` only for integration tests, `@WebMvcTest` / `@DataJpaTest` for slices.
- Use constructor injection exclusively; never `@Autowired` on fields; declare dependencies `final`.
- Validate inputs with `@Validated` + Bean Validation (`@NotNull`, `@Size`); handle `MethodArgumentNotValidException` globally with `@ControllerAdvice`.
- Scope `@Transactional` to the service layer; default read-only for queries (`readOnly = true`); never put it on controllers.
- Use OpenAPI annotations (`@Operation`, `@ApiResponse`) on controllers for accurate API docs; return `ResponseEntity<T>` for explicit HTTP status control.
