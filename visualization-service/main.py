from flask import Flask, request, jsonify, send_file
import networkx as nx
import matplotlib.pyplot as plt
import json
import os

app = Flask(__name__)

@app.route('/visualize', methods=['POST'])
def visualize():
    paper_data = request.get_json()
    papers = paper_data.get('papers', [])

    if not papers:
        return jsonify({'error': 'No paper data provided'}), 400

    G = nx.Graph()
    for paper in papers:
        G.add_node(paper['title'])

    # A simple logic to create edges: connect each paper to the first one
    if len(papers) > 1:
        first_paper = papers[0]['title']
        for i in range(1, len(papers)):
            G.add_edge(first_paper, papers[i]['title'])

    plt.figure(figsize=(12, 12))
    pos = nx.spring_layout(G)
    nx.draw(G, pos, with_labels=True, node_size=1000, node_color='skyblue', font_size=8)

    if not os.path.exists('static'):
        os.makedirs('static')

    image_path = 'static/graph.png'
    plt.savefig(image_path)
    plt.close()

    return send_file(image_path, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
