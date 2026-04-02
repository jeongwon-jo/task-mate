# Taskmate DB 테이블 명세서

> DB: PostgreSQL / ORM: Prisma

---

## Enum (열거형 상수)

### UserType — 유저 유형
| 값 | 의미 |
|----|------|
| `WORKER` | 직장인 |
| `STUDENT` | 학생 |
| `JOB_SEEKER` | 취준생 |
| `OTHER` | 기타 |

### TaskStatus — 할 일 상태
| 값 | 의미 |
|----|------|
| `TODO` | 할 예정 |
| `IN_PROGRESS` | 진행 중 |
| `DONE` | 완료 |
| `CANCELLED` | 취소 |

### Priority — 우선순위
| 값 | 의미 |
|----|------|
| `LOW` | 낮음 |
| `MEDIUM` | 보통 (기본값) |
| `HIGH` | 높음 |
| `URGENT` | 긴급 |

---

## 테이블 목록

| 테이블명 | 모델명 | 설명 |
|---------|--------|------|
| `users` | User | 유저 정보 |
| `accounts` | Account | OAuth 소셜 계정 연결 (NextAuth) |
| `sessions` | Session | 로그인 세션 (NextAuth) |
| `verification_tokens` | VerificationToken | 이메일 인증 토큰 (NextAuth) |
| `tasks` | Task | 할 일 |
| `categories` | Category | 카테고리 |
| `tags` | Tag | 태그 |
| `task_tags` | TaskTag | 할 일-태그 연결 (다대다) |
| `notes` | Note | 메모 |
| `attendances` | Attendance | 출퇴근/출석 기록 |
| `push_subscriptions` | PushSubscription | 브라우저 푸시 알림 구독 정보 |

---

## 테이블 상세

### users — 유저
| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | String (cuid) | ✅ | 자동생성 | 기본키 |
| name | String | ❌ | - | 이름 |
| email | String | ✅ | - | 이메일 (unique) |
| emailVerified | DateTime | ❌ | - | 이메일 인증 시각 |
| image | String | ❌ | - | 프로필 이미지 URL |
| password | String | ❌ | - | 비밀번호 (bcrypt 해시, 소셜로그인은 null) |
| userType | UserType | ❌ | - | 유저 유형 |
| theme | String | ✅ | `"light"` | UI 테마 |
| workStartTime | String | ✅ | `"09:00"` | 출근/공부 시작 시간 |
| workEndTime | String | ✅ | `"18:00"` | 퇴근/공부 종료 시간 |
| createdAt | DateTime | ✅ | 자동생성 | 가입일 |
| updatedAt | DateTime | ✅ | 자동갱신 | 수정일 |

**관계**: accounts, sessions, tasks, notes, categories, attendances, pushSubscriptions

---

### accounts — 소셜 계정 연결 (NextAuth 자동관리)
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | String | ✅ | 기본키 |
| userId | String | ✅ | users.id 참조 |
| type | String | ✅ | 계정 유형 (oauth 등) |
| provider | String | ✅ | 제공자 (google, github, kakao) |
| providerAccountId | String | ✅ | 제공자 측 고유 ID |
| refresh_token | String | ❌ | 리프레시 토큰 |
| access_token | String | ❌ | 액세스 토큰 |
| expires_at | Int | ❌ | 토큰 만료 시각 |
| id_token | String | ❌ | ID 토큰 |

> `(provider, providerAccountId)` 조합이 unique

---

### sessions — 로그인 세션 (NextAuth 자동관리)
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | String | ✅ | 기본키 |
| sessionToken | String | ✅ | 세션 토큰 (unique) |
| userId | String | ✅ | users.id 참조 |
| expires | DateTime | ✅ | 만료 시각 |

---

### verification_tokens — 이메일 인증 (NextAuth 자동관리)
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| identifier | String | ✅ | 식별자 (이메일 등) |
| token | String | ✅ | 인증 토큰 (unique) |
| expires | DateTime | ✅ | 만료 시각 |

---

### tasks — 할 일
| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | String | ✅ | 자동생성 | 기본키 |
| title | String | ✅ | - | 제목 |
| description | String | ❌ | - | 상세 내용 |
| status | TaskStatus | ✅ | `TODO` | 진행 상태 |
| priority | Priority | ✅ | `MEDIUM` | 우선순위 |
| dueDate | DateTime | ❌ | - | 마감일 |
| completedAt | DateTime | ❌ | - | 완료 시각 |
| userId | String | ✅ | - | users.id 참조 |
| categoryId | String | ❌ | - | categories.id 참조 |
| createdAt | DateTime | ✅ | 자동생성 | 생성일 |
| updatedAt | DateTime | ✅ | 자동갱신 | 수정일 |

**인덱스**: userId, status, dueDate  
**관계**: category, tags(TaskTag), notes

---

### categories — 카테고리
| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | String | ✅ | 자동생성 | 기본키 |
| name | String | ✅ | - | 카테고리명 |
| color | String | ✅ | `#4D0E91` | 색상 코드 |
| icon | String | ✅ | `folder` | 아이콘명 |
| userId | String | ✅ | - | users.id 참조 |
| createdAt | DateTime | ✅ | 자동생성 | 생성일 |
| updatedAt | DateTime | ✅ | 자동갱신 | 수정일 |

> `(userId, name)` 조합이 unique — 같은 유저의 카테고리 이름 중복 불가

---

### tags — 태그
| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | String | ✅ | 자동생성 | 기본키 |
| name | String | ✅ | - | 태그명 (unique) |
| color | String | ✅ | `#6B7280` | 색상 코드 |

---

### task_tags — 할 일-태그 연결 (다대다 중간 테이블)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| taskId | String | tasks.id 참조 |
| tagId | String | tags.id 참조 |

> `(taskId, tagId)` 복합 기본키 — 같은 조합 중복 불가

---

### notes — 메모
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | String | ✅ | 기본키 |
| content | String (Text) | ✅ | 내용 |
| userId | String | ✅ | users.id 참조 |
| taskId | String | ❌ | tasks.id 참조 (할 일에 연결된 메모, 없으면 독립 메모) |
| createdAt | DateTime | ✅ | 생성일 |
| updatedAt | DateTime | ✅ | 수정일 |

---

### attendances — 출퇴근/출석 기록
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | String | ✅ | 기본키 |
| userId | String | ✅ | users.id 참조 |
| date | DateTime (Date) | ✅ | 날짜 (날짜만, 시간 없음) |
| checkIn | DateTime | ❌ | 출근/시작 시각 |
| checkOut | DateTime | ❌ | 퇴근/종료 시각 |
| createdAt | DateTime | ✅ | 생성일 |
| updatedAt | DateTime | ✅ | 수정일 |

> `(userId, date)` 조합이 unique — 하루에 하나의 기록만 가능

---

### push_subscriptions — 푸시 알림 구독
| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | String | ✅ | 기본키 |
| userId | String | ✅ | users.id 참조 |
| endpoint | String | ✅ | 브라우저 푸시 엔드포인트 URL (unique) |
| p256dh | String | ✅ | 암호화 공개키 |
| auth | String | ✅ | 인증 시크릿 |
| createdAt | DateTime | ✅ | 구독일 |

---

## 테이블 관계도

```
User (1) ──── (N) Account          # 소셜 계정 (구글/깃헙/카카오)
User (1) ──── (N) Session          # 로그인 세션
User (1) ──── (N) Task             # 할 일
User (1) ──── (N) Category         # 카테고리
User (1) ──── (N) Note             # 메모
User (1) ──── (N) Attendance       # 출퇴근 기록
User (1) ──── (N) PushSubscription # 푸시 알림 구독

Task (N) ──── (1) Category         # 할 일은 하나의 카테고리
Task (1) ──── (N) Note             # 할 일에 여러 메모
Task (N) ──── (N) Tag              # 다대다 (task_tags 중간 테이블)
```
