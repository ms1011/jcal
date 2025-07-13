# jcal

터미널에서 직접 일정을 관리하고 할 일 목록을 관리하는 CLI 도구입니다.

모든 일정 데이터는 `jcal` 명령이 실행되는 현재 작업 디렉토리에 있는 `schedule.json` 파일에 저장됩니다.

## 설치

`jcal`을 전역으로 설치하려면 다음을 실행하세요:

```bash
```bash
npm install -g jcal-cli
```

또는 전역 설치 없이 `npx`를 사용하여 실행할 수 있습니다:

```bash
npx jcal <command>
```

## 사용법

### `jcal init`

현재 디렉토리에 `schedule.json` 파일이 없으면 빈 파일을 생성합니다.

```bash
jcal init
```

### `jcal add <titles...>`

하나 이상의 새 일정을 추가합니다. 기본적으로 `todo` 유형을 생성합니다. `-d` 또는 `--detailed` 플래그를 사용하여 `detailed` 일정을 생성합니다. 여러 상세 일정을 추가할 때는 `--time` 및 `--content` 옵션이 모두 필요합니다.

```bash
jcal add "우유 사기"
jcal add "작업 A" "작업 B" "작업 C"
jcal add "팀 회의" -d --time "내일 오후 3시" --content "4분기 로드맵 논의"
jcal add "프로젝트 검토" "고객 전화" -d --time "금요일 오전 10시" --content "프레젠테이션 준비"
```

### `jcal list` (또는 `jcal ls`)

모든 일정을 나열합니다. 기본적으로 `pending` 항목만 표시합니다. `--done`을 사용하여 `done` 항목만 표시하거나, `--all`을 사용하여 모든 항목을 표시합니다. 가독성을 높이기 위해 출력은 색상으로 구분됩니다:

*   `pending` 항목: `○` 아이콘과 함께 노란색.
*   `done` 항목: `✔` 아이콘과 함께 회색 및 취소선.
*   `todo` 유형: 청록색.
*   `detailed` 유형: 마젠타색.

```bash
jcal ls
jcal ls --done
jcal ls --all
```

### `jcal done <id>`

주어진 `<id>`를 가진 일정을 `done`으로 표시합니다.

```bash
jcal done a3b8c1f9
```

### `jcal remove <id>` (또는 `jcal rm`)

주어진 `<id>`를 가진 일정을 삭제합니다. 명령은 삭제된 일정의 제목과 ID를 표시하여 제거를 확인합니다.

```bash
jcal rm a3b8c1f9
```

### `jcal update <id>`

기존 일정을 업데이트합니다. 변경할 내용을 지정하려면 옵션(`--title`, `--time`, `--content`)을 사용합니다.

```bash
jcal update a3b8c1f9 --title "아몬드 우유 사기"
```
