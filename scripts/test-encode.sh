#!/bin/bash

# Script de test pour l'endpoint d'encodage vidéo
# Usage: ./scripts/test-encode.sh [URL_BASE]

URL_BASE=${1:-"http://localhost:3000"}

echo "🧪 Test encodage vidéo sur: $URL_BASE"
echo ""

# Test avec images Picsum
echo "📸 Test avec 5 images Picsum..."
RESPONSE=$(curl -s -X POST "$URL_BASE/encode" \
  -H "Content-Type: application/json" \
  -d '{
    "images":[
      "https://picsum.photos/seed/car1/1080/1920",
      "https://picsum.photos/seed/car2/1080/1920", 
      "https://picsum.photos/seed/car3/1080/1920",
      "https://picsum.photos/seed/car4/1080/1920",
      "https://picsum.photos/seed/car5/1080/1920"
    ],
    "title":"Test Rentop Clips Studio",
    "fps":30,
    "durationPerImage":2
  }')

echo "📝 Réponse encodage:"
echo "$RESPONSE" | jq .

# Extraire l'URL de la vidéo si succès
VIDEO_URL=$(echo "$RESPONSE" | jq -r '.url // empty')

if [ ! -z "$VIDEO_URL" ] && [ "$VIDEO_URL" != "null" ]; then
    echo ""
    echo "✅ Succès! Vidéo générée:"
    echo "🔗 $VIDEO_URL"
    echo ""
    echo "🎬 Pour tester la vidéo:"
    echo "   curl -I '$VIDEO_URL'"
    echo "   # ou ouvrir dans navigateur"
else
    echo ""
    echo "❌ Échec de l'encodage"
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error // "Erreur inconnue"')
    echo "🚨 Erreur: $ERROR_MSG"
fi

echo ""
echo "🔍 Pour débugger:"
echo "   - Vérifier logs Vercel Functions"
echo "   - Confirmer bucket Supabase 'public' existe et accessible"
echo "   - Tester FFmpeg local: ffmpeg -version"