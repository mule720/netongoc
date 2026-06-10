import json
import urllib.request
import http.cookiejar

# Create a cookie jar to handle session cookies
cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

# Test login mutation with the actual user
login_query = 'mutation { login(email: "admin@netonlimited.com", password: "admin123") { success message user { id email } } }'

url = 'http://127.0.0.1:8000/graphql/'
data = json.dumps({'query': login_query}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    response = opener.open(req)
    result = response.read().decode()
    print('Login Response:', result)
    print('\nCookies in jar:')
    for cookie in cookie_jar:
        print(f'  {cookie.name}={cookie.value}')
    
    # Now try to call Me query with the session
    print('\n--- Testing Me query with session ---')
    me_query = 'query { me { id email } }'
    data2 = json.dumps({'query': me_query}).encode('utf-8')
    req2 = urllib.request.Request(url, data=data2, headers={'Content-Type': 'application/json'})
    response2 = opener.open(req2)
    result2 = response2.read().decode()
    print('Me Query Response:', result2)
except Exception as e:
    print('Error:', str(e))
    import traceback
    traceback.print_exc()
