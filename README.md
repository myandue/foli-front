# Foli

## 목적

- 학습을 목적으로 한 python 서비스 구현
- 혼자서 하나의 프로젝트를 완성해낼 수 있을 정도의 프론트엔드 학습

## 목표

- 프로젝트 완성
- 기본적인 Authentication에 대한 이해 및 적용
- 기획/프론트엔드/백엔드/AI 영역을 나누어 스케쥴에 맞춰 진행
- 사용할 프레임워크 및 라이브러리(Django, FastAPI, React)에 대한 학습
- AI 서비스 활용 (Clova Studio, Clova Speech)
<br>

---

<br>

# FrontEnd

## Tools

- React

## 기능
> ( ): 구현 예정

#### 유저

- 회원가입
- (프로필 조회)
- (프로필 수정)
- (회원 탈퇴)

#### Auth

- 로그인
- (로그아웃)
- API 호출 시, 헤더에 access_token 포함
- access_token 만료 응답을 받을 시, access_token과 refresh_token 재발급 및 API 재요청 

#### 퀴즈

- 검색어/난이도/퀴즈개수 입력 및 제출하여 퀴즈 생성 (default: 난이도 - NORMAL, 개수 - 10개)
- 주어진 퀴즈에 대한 응답을 모두 선택 완료 했을 시에 채점
- 채점 완료 후 '새 퀴즈 시작하기' / '다시 도전하기' 선택
- 퀴즈 파트는 STT 서비스에서도 사용할 예정으로, 기능과 페이지를 별도의 Component로 분리
  
#### 음성 파일 요약

- 음성 파일 업로드 - 업로드 완료 시 [transcript, summary, quiz] 탭 파트 생성
- Transcribe API 호출 및 렌더링
- Summarize API 호출 및 렌더링
- 해당 transcription 기반 Quiz 생성 API 호출 및 렌더링
- Summarize API, Quiz API는 transcription이 존재할 경우에만 호출 가능 
- (transcription 기반 질의응답 Chat Bot 호출)
