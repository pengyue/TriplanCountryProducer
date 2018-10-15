node {

    try {

        def commit_id

        stage ("Preparation & Checkout") {
            checkout scm
            //sh "git rev-parse --short HEAD > .git/commit-id"
            //commit_id = readFile('.git/commit-id').trim()
            commit_id = "latest"
        }

        stage('Docker Build & Push') {
             docker.withRegistry('https://index.docker.io/v1/', 'Dockerhub') {
               def app = docker.build("pengyue/triplan-country-producer:${commit_id}", '.').push()
             }
        }

    } catch(error) {
        throw error
    } finally {
        // Any cleanup operations needed, whether we hit an error or not
    }

}