#!/bin/bash

# Script de test pour les endpoints de publication sociale
# Usage: ./scripts/test-social.sh [URL_BASE] [VIDEO_URL]

URL_BASE=${1:-"http://localhost:3000"}
VIDEO_URL=${2:-"https://example.com/test.mp4"}

echo "📱 Test publication sociale sur: $URL_BASE"
echo "🎥 Vidéo test: $VIDEO_URL"
echo ""

CAPTION="🚗 Réserve ta voiture sur Rentop.co ! #rentop #dubai #lamborghini"

# Test de tous les endpoints de publication
PLATFORMS=("instagram" "tiktok" "youtube" "pinterest" "x")

for platform in "${PLATFORMS[@]}"; do
    echo "🧪 Test publication $platform..."
    
    RESPONSE=$(curl -s -X POST "$URL_BASE/publish/$platform" \
        -H "Content-Type: application/json" \
        -d "{
            \"videoUrl\": \"$VIDEO_URL\",
            \"caption\": \"$CAPTION\"
        }")
    
    echo "📝 Réponse $platform:"
    echo "$RESPONSE" | jq .
    echo ""
done

echo "🔍 Test OAuth endpoints..."

# Test des redirections OAuth
for platform in "${PLATFORMS[@]}"; do
    echo "🔐 Test OAuth $platform..."
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL_BASE/api-auth/$platform")
    
    if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "200" ]; then
        echo "✅ OAuth $platform: HTTP $HTTP_CODE (OK)"
    else
        echo "⚠️  OAuth $platform: HTTP $HTTP_CODE"
    fi
done

echo ""
echo "📋 Prochaines étapes:"
echo "   1. Configurer variables d'environnement pour chaque plateforme"
echo "   2. Créer apps développeur sur chaque réseau social"
echo "   3. Implémenter logique OAuth + token refresh"
echo "   4. Tester publication avec vrais comptes autorisés"