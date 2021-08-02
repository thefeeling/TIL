---
title: S3 + CloudFront + Route53 + Vuepress + Gulp을 활용한 SPA 어플리케이션 배포
date: 2019/7/12 00:00:00
categories:
- AWS
---

## S3 + CloudFront + Route53 + Vuepress + Gulp을 활용한 SPA 어플리케이션 배포

회사에서 별도로 업무 문서 관리 용도로 Static 사이트를 배포해야 할 일이 생겨서, 어차피 AWS 환경을 사용하고 있으니 S3 + Cloudfront + Route53을 활용하여 사이트를 배포하면 좋을꺼 같아 해당 업무를 수행하면서 사용했던 내용을 간단하게 정리해봤다.

문서는 어차피 마크다운으로 작성하기 때문에, 마크다운을 Static Resource로 변환해주는 프레임워크나 환경을 찾다가 우연하게 미려한 UI에 끌려 [Vuepress](https://vuepress.vuejs.org/)를 선택하게 됬다.

- 템플릿 참고: [vuepress-template](https://github.com/stasson/vuepress-template)

배포 방법은 여러가지가 있겠지만, 우선 급한대로 gulp를 활용하여 배포 스크립트를 작성했고 스크립트 내용은 별게 없기 때문에 아래와 같이 작성하여 사용했다.

#### gulpfile.js
```javascript

'use strict';

const gulp = require('gulp');
const awspublish = require('gulp-awspublish');
const cloudfront = require("gulp-cloudfront");
require('dotenv').config();

gulp.task('publish', () => {
  const aws = {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    distributionId: process.env.PROD_DISTRIBUTION_ID,
    params: {
      Bucket: process.env.PROD_BUCKET
    },
  };

  const headers = {
    "Cache-Control": "max-age=0"
  };


  const publisher = awspublish.create(aws);
  return gulp.src('./public/**/*')
    .pipe(awspublish.gzip())
    .pipe(publisher.publish(headers))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter())
    .pipe(cloudfront(aws));
});
```
배포에 필요한 환경변수는 `.env`을 통하여 참조하도록 구성했다. 파일의 내용은 하단과 같다. 환경과 관련된 중요한 정보를 담고 있기 떄문에 VersionControl을 하지 않고 로컬에서만 관리하도록 했다.

#### .env
```bash
# AWS 리전명
AWS_REGION={AWS REGION} 

# 액세스 키
AWS_ACCESS_KEY_ID={ACCESS_KEY}

# 시크릿 키
AWS_SECRET_ACCESS_KEY={SECRET_ACCESS_KEY}

# 버킷명
PROD_BUCKET={BUCKET_NAME}

# CloudFront 배포ID
PROD_DISTRIBUTION_ID={CLOUDFRONT_DISTRIBUTION-ID}
```


### S3 버킷 생성
![](https://i.imgur.com/sM202Cw.png)
  - 버킷 생성 후 Static Web Site 옵션 활성화

### CloudFront 설정
#### Distribution
- Price-Class
  - 필요에 맞는 지역을 선택, Global을 사용하게 되면 과금이 크게 될 수 있으므로 적절한 선택이 필요함.
- WAF Web ACL
  - 별도로 병화벽 사용 시 지정, WAF를 사용하면 IP Whitelist 관리 및 SQL Injection 공격까지 막아 줄 수 있음
- Alternate Domain Names
  - Route53에서 지정한 CNAME 사용
- SSL Certificate
  - Custom SSL Certificate 지정, AWS Certificate Manager에서 생성한 인증서 사용하면 편함
- Security Policy
  - TLSv1.1_2016 (recommended)
- Supported HTTP Versions
  - HTTP/2, HTTP/1.1, HTTP/1.0
- Default Root Object
  - index.html 지정
#### Origins and Origin Groups
- Origin Domain Name: S3 static site 경로를 지정
- Restrict Bucket Access: No

#### Behaviors
- HTTP METHOD, 캐싱 정책 및 HTTP 리다이렉션을 지정할 수 있음
- 요청/응답 주기에 따른 AWS Lambda Function 지정 가능

#### Error Pages
![](https://i.imgur.com/KHZH6e4.png)
- HTTP Error Code가 발생했을 때, 이후 액션을 어떻게 할건지 정할 수 있음.
- SPA의 경우, Client-Side Routing을 하기 떄문에, 실제 S3 오리진에 없는 리소스가 존재하더라도 접근에 대한 제어는 Client Application에서 제어 해야 함.

#### Invalidations
- 캐싱된 CloudFront의 자원을 Invalidation 할때 사용 

### Route53 설정
* Hosted-Zone -> Create-Record-Set
![](https://i.imgur.com/P5clcf6.png)
- `Name`에는 서브도메인명 지정
- `Alias`의 값은 `Yes`로 지정
- `Alias Target`의 값은 위에서 배포한 CloudFront의 Domain Name을 지정
- `Create`를 누르고 마무리

### 참고 URL
- [Amazon S3 버킷과 함께 CloudFront 배포 사용](https://support.ptc.com/help/thingworx_hc/thingworx_utilities_8_hc/ko/index.html#page/ThingWorx_Utilities/Converge_CDNCloudFrontWS3.html)
- [S3 웹 사이트 엔드포인트를 CloudFront 배포의 오리진으로 사용하고 있습니다. HTTP 응답 코드 403(액세스 거부)이 수신되는 이유는 무엇입니까?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/s3-website-cloudfront-error-403/)
- [How To Host Static Website On Amazon AWS S3](https://www.hackingnote.com/en/web-deployment/how-to-host-static-website-on-amazon-aws-s3)
- [Host a Static Site on AWS, using S3 and CloudFront](https://www.davidbaumgold.com/tutorials/host-static-site-aws-s3-cloudfront/)
