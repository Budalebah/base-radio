# Base Radio Contracts

## Kurulum

1. Foundry yüklü olduğundan emin olun.
2. Bağımlılıkları yükleyin (gerekirse `forge install`).

## Derleme

```bash
forge build
```

## Deploy (Base Sepolia)

Environment değişkenlerini ayarlayın veya doğrudan komuta ekleyin:

```bash
# .env dosyasını yüklemek için
source .env

# Deploy komutu
forge create ./src/BaseRadio.sol:BaseRadio \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

Deploy sonrası kontrat adresini not edin ve frontend tarafındaki `app/calls.ts` dosyasına ekleyin.

