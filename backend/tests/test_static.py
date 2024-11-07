def test_index_route(client):
    response = client.get('/')
    assert response.status_code == 200
    assert 'text/html' in response.content_type

def test_nonexistent_path(client):
    response = client.get('/nonexistent')
    assert response.status_code == 404 