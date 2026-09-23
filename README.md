# Takeda Lab. — Astro サイト

武田圭史研究室の日本語・英語サイトです。G案のレイアウトを基に、研究領域、成果・活動、メンバー、交流・参加案内を掲載します。現在の掲載内容は確認用です。未登録の記事や学生プロフィールを実績として表示しません。

## ローカルで確認する

Node.js 22.12.0以降とnpmを使用します。

```sh
npm ci
cp .env.example .env.local
npm run dev
```

表示されたURLを開いてください。日本語は `/`、英語は `/en/` です。microCMSに接続しない状態でも、コード内の基本情報と「掲載準備中」の表示を確認できます。

公開済みコンテンツを実際に表示するには、`.env.local` の `PUBLIC_MICROCMS_API_KEY` に、**公開済みコンテンツのGETだけを許可したキー**を設定して開発サーバーを再起動します。キーはブラウザに配信されるため、下書き取得、書き込み、マネジメントAPIの権限を付けないでください。`.env.local` はGitに含まれません。実キーをREADMEやコミット、共有スクリーンショットに載せないでください。

```sh
npm run verify   # 型チェック、ビルド、内部リンク・アセットの確認
npm run preview  # ビルド結果の表示
```

microCMSの公開済みデータはブラウザから取得します。記事やメンバーなどの内容を更新するたびにAstroを再ビルドする必要はありません。HTML/CSS/TypeScriptの変更を公開する場合はビルドとデプロイが必要です。

## 掲載内容の編集

microCMSサービス `SFC-T-Lab-Web` (`t-lab.microcms.io`) の `site`、`research-areas`、`posts`、`members`、`tags` を使います。項目と運用上の注意は [cms/README.md](cms/README.md) を参照してください。英語が未入力の項目は日本語を表示します。

| 内容 | 編集場所 |
| --- | --- |
| 研究会紹介、交流・参加、アクセス | microCMS `site` |
| 研究領域 | microCMS `research-areas` |
| 成果・活動の記事本文、日付、カテゴリ | microCMS `posts` |
| 記事のタグ | microCMS `tags` |
| 教員・学生・卒業生 | microCMS `members` |
| ページ構成・掲載順 | `src/components/HomePage.astro` |
| CMSの取得と表示 | `src/cms/`、`src/scripts/cms-home.ts`、`src/scripts/cms-post.ts` |
| CMS未登録時の基本情報 | `src/data/` |
| スタイル | `public/takeda-list.css` と先行するG案CSS |

記事を公開すると一覧に出て、個別記事の `/posts/?id=...`（英語は `/en/posts/?id=...`）から本文を読めます。研究領域は最初の1件が公開された時点でCMSの一覧に切り替わるため、6領域を揃えて公開する運用を想定しています。メンバーは最初の教員を大きく見せ、その他は「詳細を見る」にまとめます。

現在、記事・メンバーの実データは未登録です。創作した実績や学生プロフィールは表示していません。お問い合わせはサイト内のフォームから共有Googleフォームへ送信できます。返信先メールアドレスは回答者が入力する項目で、研究室のメールアドレスは掲載していません。地図の表示にはインターネット接続が必要です。

## お問い合わせフォーム

`public/contact-form.html` がサイト内フォームです。質問IDと送信先は共有Googleフォームの回答ページから確認したものを設定しています。送信には `formResponse` を使用し、送信後はページを移動せず確認ダイアログを表示します。ローカルでの確認ページは `/contact-preview/` です。Googleフォームへの直接リンクもフォーム内に残しています。

この送信方法はGoogle Formsの公開APIではありません。Googleフォームの質問を作り直した場合は `entry.<番号>` の対応を見直し、実際に1件送って回答が正しい欄に入るか確認してください。サイト側はGoogleフォームに保存されたことを厳密には判定できず、ダイアログは送信先の読み込み完了に基づいて表示されます。新着回答メール通知は操作した慶應アカウントで有効にしました。ほかの共同編集者も通知を受けたい場合は、各自のアカウントでGoogleフォームの「回答」タブから有効にします。

## Gitと公開先

このディレクトリは独立したローカルGitリポジトリで、[sfc-tlab-web](https://github.com/keijitakeda/sfc-tlab-web) の `main` に接続しています。G案の元リポジトリは [tlab-design-test](https://github.com/Hayato1031/tlab-design-test) です。`.github/workflows/deploy.yml` は `main` へのプッシュ時にGitHub Pagesへビルド・公開します。リポジトリのActionsシークレット `PUBLIC_MICROCMS_API_KEY` に、公開済みコンテンツのGETだけを許可したキーを設定し、管理者がPagesの公開元を「GitHub Actions」に設定する必要があります。GitHub Pages向けビルドでは `/sfc-tlab-web/` を使い、ローカル開発では従来どおり `/` で表示します。

`dist/` は生成物です。直接編集しないでください。
