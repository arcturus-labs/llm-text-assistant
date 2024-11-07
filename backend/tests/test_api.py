def test_echo_endpoint(client):
    response = client.post('/api/echo', json="hello world")
    assert response.status_code == 200
    assert response.json == "HELLO WORLD"

def test_echo_endpoint_empty(client):
    response = client.post('/api/echo', json="")
    assert response.status_code == 200
    assert response.json == ""
