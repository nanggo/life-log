---
title: "Google domain에서 cloudflare로"
date: 2023-06-22T00:06:44.000Z
tags:
  - cloudflare
  - tip
thumbnail: ''
draft: false
slug: "migrating-from-google-domains-to-cloudflare"
---

구글이 도메인 등록 서비스를 종료한다고 한다[^1]. 공유기나 NAS에서 구글 DDNS를 지원해주고 있어서 이용하고 있었는데, 옮겨야 하는 명분이 생겼다. [Porkbun](https://porkbun.com)과 [Cloudflare](https://cloudflare.com) 중에서 고민을 했는데, Cloudflare가 무료로 이용할 수 있는 여러 부가 서비스가 있어서 Cloudflare로 옮겼다.

공유기에서 cloudflare DDNS를 직접적으로 지원해 주고 있지 않아서 cloudflare에서 제공하는 API를 이용해서 DDNS를 구현했다[^2]. 스크립트 샘플은 [Github Merlin wiki](https://github.com/RMerl/asuswrt-merlin.ng/wiki/DDNS-Sample-Scripts#cloudflare)에서 확인할 수 있다. 다만, 이대로 적용하면 안되고 수정이 필요하다.

```sh
#!/bin/sh

ZONEID= # Your zone id, hex16 string
RECORDID= # You DNS record ID, hex16 string
RECORDNAME= # Your DNS record name, e.g. sub.example.com
API= # Cloudflare API Key
EMAIL= # Cloudflare account email
IP="$(/usr/sbin/nvram get wan0_ipaddr)"

curl -fs -o /dev/null -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONEID/dns_records/$RECORDID" \
  -H "X-Auth-Email: $EMAIL" \
  -H "X-Auth-Key: $API" \
  -H "Content-Type: application/json" \
  --data "{\"type\":\"A\",\"name\":\"$RECORDNAME\",\"content\":\"$IP\",\"ttl\":120,\"proxied\":false}"

if [ $? -eq 0 ]; then
  /sbin/ddns_custom_updated 1
else
  /sbin/ddns_custom_updated 0
fi
```

RECORDID는 아래와 같은 명령어로 알아낼 수 있다[^3].

```sh
 curl -X GET "https://api.cloudflare.com/client/v4/zones/개인 ZONE_ID/dns_records?type=필터링할_레코드_타입&name=필터링할_레코드_이름" \
    -H "X-Auth-Email: 이메일 주소" \
    -H "X-Auth-Key: Cloudflare API 키" \
    -H "Content-Type: application/json" # | jq .result json 결과값을 보기 좋게 하기 위해서 jq를 썼음
```

Cloudflare에서 허용된 포트는 [여기](https://developers.cloudflare.com/fundamentals/get-started/reference/network-ports)에서 확인 가능하니 이를 참고해서 내가 이용중인 포트가 막혀 있다면, npm(nginx-proxy-manager)을 이용하면 된다.

---

[^1]: https://support.google.com/domains/answer/13689670
[^2]: https://developers.cloudflare.com/dns/manage-dns-records/how-to/managing-dynamic-ip-addresses/
[^3]: https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-list-dns-records
