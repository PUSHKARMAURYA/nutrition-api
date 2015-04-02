#Nutrition API

A simple JSON API for food macronutrients and kcal.
Currently has a single source: USDA SR27.


###Plans
* Include other sources e.g. CoFIDS
* Search by macronutrient/kcal value and range of values
* API authentication for editing names, adding tags, adding new foods

####Single Word
GET `https://api.damonmcminn.com/nutrition/food?search=pinyon`

```javascript
{
  "links": {
    "self": "https://api.damonmcminn.com/nutrition/food?search=pinyon"
  },
  "total_foods": 1,
  "total_pages": 1,
  "foods": [
    {
      "name": "pine nuts,pinyon,dried",
      "kcal": 6.29,
      "protein": 0.1157,
      "fat": 0.6098,
      "carbohydrate": 0.193,
      "source": {
        "organisation": "usda",
        "version": "sr27"
      },
      "values": {
        "unit": "g",
        "per": 1
      }
    }
  ]
}
```

####Multiple words separated by hyphens
GET `https://api.damonmcminn.com/nutrition/food?search=turtle-green-raw`

```javascript
{
  "links": {
    "self": "https://api.damonmcminn.com/nutrition/food?search=green-turtle-raw"
  },
  "total_foods": 1,
  "total_pages": 1,
  "foods": [
    {
      "name": "turtle,green,raw",
      "kcal": 0.89,
      "protein": 0.198,
      "fat": 0.005,
      "carbohydrate": 0,
      "source": {
        "organisation": "usda",
        "version": "sr27"
      },
      "values": {
        "unit": "g",
        "per": 1
      }
    }
  ]
}
```
